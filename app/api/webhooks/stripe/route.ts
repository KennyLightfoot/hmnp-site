import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { sendEmail } from '@/lib/email';
import {
  bookingConfirmationEmail,
  paymentFailedEmail,
} from '@/lib/email/templates';
import { sendSms as newSendSms, checkSmsConsent } from '@/lib/sms';
import { bookingConfirmationSms, paymentFailedSms } from '@/lib/sms/templates';
import * as ghl from '@/lib/ghl';
import { addContactToWorkflow } from '@/lib/ghl/management';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id);

  const bookingId = session.metadata?.bookingId;
  if (!bookingId) {
    console.error('No booking ID found in checkout session metadata');
    return;
  }

  try {
    // Update booking status
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        depositStatus: 'COMPLETED'
      },
      include: {
        service: true,
        User_Booking_signerIdToUser: true,
        promoCode: true
      }
    });

    // Send confirmation emails
    await sendConfirmationEmails(booking);

    // Update GHL contact status
    await updateGHLAfterPayment(booking);

    console.log(`Booking ${bookingId} confirmed successfully via checkout session`);
  } catch (error) {
    console.error('Error updating booking after checkout session completion:', error);
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);

  const bookingId = paymentIntent.metadata.bookingId;
  if (!bookingId) {
    console.error('No booking ID found in payment metadata');
    return;
  }

  try {
    // Update payment record
    await prisma.payment.updateMany({
      where: {
        paymentIntentId: paymentIntent.id,
        bookingId: bookingId
      },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(),
        transactionId: paymentIntent.id
      }
    });

    // Update booking status
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        depositStatus: 'COMPLETED'
      },
      include: {
        service: true,
        User_Booking_signerIdToUser: true,
        promoCode: true
      }
    });

    // Send confirmation emails
    await sendConfirmationEmails(booking);

    // Sync with GHL if needed
    await syncWithGHL(booking);

    console.log(`Booking ${bookingId} confirmed successfully`);
  } catch (error) {
    console.error('Error updating booking after payment success:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);

  const bookingId = paymentIntent.metadata.bookingId;
  if (!bookingId) {
    console.error('No booking ID found in payment metadata');
    return;
  }

  try {
    // Update payment record
    await prisma.payment.updateMany({
      where: {
        paymentIntentId: paymentIntent.id,
        bookingId: bookingId
      },
      data: {
        status: 'FAILED'
      }
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'PAYMENT_PENDING', // Keep as payment pending for retry
        depositStatus: 'FAILED'
      }
    });

    console.log(`Payment failed for booking ${bookingId}`);
  } catch (error) {
    console.error('Error updating booking after payment failure:', error);
  }
}

async function sendConfirmationEmails(booking: any) {
  try {
    // Customer confirmation email
    if (booking.User_Booking_signerIdToUser?.email) {
      await resend.emails.send({
        from: 'notifications@houstonmobilenotary.com',
        to: booking.User_Booking_signerIdToUser.email,
        subject: 'Booking Confirmed - Houston Mobile Notary Pros',
        html: generateCustomerConfirmationEmail(booking)
      });
    }

    // Admin notification email
    await resend.emails.send({
      from: 'notifications@houstonmobilenotary.com',
      to: process.env.ADMIN_EMAIL || 'admin@houstonmobilenotary.com',
      subject: 'New Booking Confirmed',
      html: generateAdminNotificationEmail(booking)
    });

    // Update notification log
    await prisma.notificationLog.createMany({
      data: [
        {
          bookingId: booking.id,
          notificationType: 'BOOKING_CONFIRMATION',
          method: 'EMAIL',
          recipientEmail: booking.User_Booking_signerIdToUser?.email,
          subject: 'Booking Confirmed - Houston Mobile Notary Pros',
          message: 'Booking confirmation sent to customer',
          status: 'SENT'
        },
        {
          bookingId: booking.id,
          notificationType: 'BOOKING_CONFIRMATION',
          method: 'EMAIL',
          recipientEmail: process.env.ADMIN_EMAIL || 'admin@houstonmobilenotary.com',
          subject: 'New Booking Confirmed',
          message: 'Admin notification sent',
          status: 'SENT'
        }
      ]
    });

    console.log('Confirmation emails sent successfully');
  } catch (error) {
    console.error('Error sending confirmation emails:', error);
  }
}

function generateCustomerConfirmationEmail(booking: any): string {
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(new Date(date));
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Booking Confirmed!</h1>
      
      <p>Dear ${booking.User_Booking_signerIdToUser?.name || 'Valued Customer'},</p>
      
      <p>Your appointment has been successfully confirmed. Here are your booking details:</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Appointment Details</h3>
        <p><strong>Service:</strong> ${booking.service.name}</p>
        <p><strong>Date & Time:</strong> ${formatDateTime(booking.scheduledDateTime)}</p>
        <p><strong>Duration:</strong> ${booking.service.durationMinutes} minutes</p>
        
        ${booking.addressStreet ? `
          <p><strong>Location:</strong><br>
          ${booking.addressStreet}<br>
          ${booking.addressCity}, ${booking.addressState} ${booking.addressZip}</p>
        ` : ''}
        
        ${booking.promoCode ? `
          <p><strong>Promo Code Applied:</strong> ${booking.promoCode.code}</p>
          <p><strong>Discount:</strong> $${booking.promoCodeDiscount}</p>
        ` : ''}
        
        <p><strong>Deposit Paid:</strong> $${booking.depositAmount}</p>
      </div>
      
      <p>We'll send you a reminder 24 hours before your appointment.</p>
      
      <p>If you need to reschedule or have any questions, please reply to this email or call us at (713) 487-8918.</p>
      
      <p>Thank you for choosing Houston Mobile Notary Pros!</p>
      
      <p>Best regards,<br>
      The Houston Mobile Notary Pros Team</p>
    </div>
  `;
}

function generateAdminNotificationEmail(booking: any): string {
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(new Date(date));
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc2626;">New Booking Confirmed</h1>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Booking Details</h3>
        <p><strong>Booking ID:</strong> ${booking.id}</p>
        <p><strong>Customer:</strong> ${booking.User_Booking_signerIdToUser?.name} (${booking.User_Booking_signerIdToUser?.email})</p>
        <p><strong>Service:</strong> ${booking.service.name}</p>
        <p><strong>Date & Time:</strong> ${formatDateTime(booking.scheduledDateTime)}</p>
        <p><strong>Duration:</strong> ${booking.service.durationMinutes} minutes</p>
        
        ${booking.addressStreet ? `
          <p><strong>Location:</strong><br>
          ${booking.addressStreet}<br>
          ${booking.addressCity}, ${booking.addressState} ${booking.addressZip}</p>
        ` : ''}
        
        ${booking.locationNotes ? `<p><strong>Location Notes:</strong> ${booking.locationNotes}</p>` : ''}
        ${booking.notes ? `<p><strong>Customer Notes:</strong> ${booking.notes}</p>` : ''}
        
        <p><strong>Total Price:</strong> $${booking.priceAtBooking}</p>
        <p><strong>Deposit Paid:</strong> $${booking.depositAmount}</p>
        
        ${booking.promoCode ? `
          <p><strong>Promo Code:</strong> ${booking.promoCode.code} (-$${booking.promoCodeDiscount})</p>
        ` : ''}
      </div>
      
      <p>This booking requires immediate attention for assignment and preparation.</p>
    </div>
  `;
}

async function updateGHLAfterPayment(booking: any) {
  try {
    // Get the customer email from the booking
    const customerEmail = booking.User_Booking_signerIdToUser?.email || booking.guestEmail;
    
    if (!customerEmail) {
      console.log('No customer email found for GHL update');
      return;
    }

    // Find the contact in GHL
    const contact = await ghl.getContactByEmail(customerEmail);
    
    if (contact?.id) {
      // Update tags to reflect payment completion
      const tagsToApply = [
        'status:booking_confirmed',
        'payment:completed'
      ];
      
      // Remove pending payment tag and add confirmed tags
      await ghl.addTagsToContact(contact.id, tagsToApply);
      
      // Trigger payment completion workflow if configured
      if (process.env.GHL_PAYMENT_COMPLETED_WORKFLOW_ID) {
        try {
          await addContactToWorkflow(contact.id, process.env.GHL_PAYMENT_COMPLETED_WORKFLOW_ID);
          console.log(`GHL: Added contact ${contact.id} to payment completion workflow`);
        } catch (workflowError) {
          console.error('Error adding contact to payment completion workflow:', workflowError);
        }
      }
      
      console.log(`GHL: Updated contact ${contact.id} after payment completion`);
    } else {
      console.log('GHL: Contact not found for payment update');
    }
  } catch (error) {
    console.error('Error updating GHL after payment:', error);
  }
}

async function syncWithGHL(booking: any) {
  // Use the same function as payment completion for consistency
  await updateGHLAfterPayment(booking);
}
