import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import * as ghl from '@/lib/ghl';
import { BookingStatus, PaymentStatus, ServiceType, User } from '@prisma/client';
import { sendEmail } from '@/lib/email';
import {
  bookingConfirmationEmail,
  paymentFailedEmail,
} from '@/lib/email/templates';
import { sendSms as newSendSms, checkSmsConsent } from '@/lib/sms';
import { bookingConfirmationSms, paymentFailedSms } from '@/lib/sms/templates';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey || !stripeWebhookSecret) {
  // It's better to log this error and potentially prevent startup 
  // or return a clear error in requests if Stripe functionality is critical.
  // For a webhook, it might mean it can't verify signatures.
  console.error('CRITICAL: Stripe secret key or webhook secret is not set in environment variables.');
  // Depending on deployment, you might throw an error here to halt startup if Stripe is essential.
  // throw new Error('Stripe secret key or webhook secret is not set.'); 
}

// Initialize Stripe, handle potential missing key more gracefully for webhooks
// The webhook construction will fail if stripeWebhookSecret is missing, handled in POST.
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2025-04-30.basil' as const }) : null;

export async function POST(request: Request) {
  if (!stripe) {
    console.error('Stripe webhook error: Stripe SDK not initialized (missing STRIPE_SECRET_KEY).');
    return NextResponse.json({ error: 'Stripe configuration error.' }, { status: 500 });
  }
  if (!stripeWebhookSecret) {
    console.error('Stripe webhook error: STRIPE_WEBHOOK_SECRET is not set. Cannot verify signature.');
    return NextResponse.json({ error: 'Webhook security configuration error.' }, { status: 500 });
  }

  const sig = request.headers.get('stripe-signature');
  let event: Stripe.Event;

  try {
    const rawBody = await request.text();
    if (!sig) {
      console.error('Stripe webhook error: No signature found in headers.');
      return NextResponse.json({ error: 'Webhook signature verification failed. No signature.' }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(rawBody, sig, stripeWebhookSecret);
  } catch (err: any) {
    console.error(`Stripe webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
      console.log('Stripe Event: payment_intent.succeeded, ID:', paymentIntentSucceeded.id);

      const bookingId = paymentIntentSucceeded.metadata?.bookingId;
      const paymentIntentId = paymentIntentSucceeded.id;

      if (!bookingId) {
        console.error('Stripe webhook error: bookingId missing in payment_intent.succeeded metadata for PI:', paymentIntentId);
        return NextResponse.json({ received: true, error: 'Missing bookingId in metadata' }, { status: 200 }); // Ack to Stripe
      }

      try {
        // 1. Update Payment record status
        const updatedPayment = await prisma.payment.updateMany({
          where: {
            paymentIntentId: paymentIntentId,
            Booking: { id: bookingId },
            status: PaymentStatus.PENDING, // Ensure we only update pending payments
          },
          data: { status: PaymentStatus.COMPLETED },
        });

        if (updatedPayment.count === 0) {
          console.warn(`Stripe webhook: No PENDING payment record found or updated for bookingId: ${bookingId}, PI: ${paymentIntentId}. It might have been already processed or not found.`);
        }

        // 2. Update Booking status
        const updatedBooking = await prisma.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.CONFIRMED },
          include: { 
            User_Booking_signerIdToUser: { select: { email: true, name: true } },
            service: { select: { name: true, serviceType: true } },
          },
        });

        if (!updatedBooking || !updatedBooking.User_Booking_signerIdToUser?.email || !updatedBooking.User_Booking_signerIdToUser?.name) {
          console.error(`Stripe webhook: Failed to update booking or retrieve user details for bookingId: ${bookingId}`);
          return NextResponse.json({ received: true, error: 'Failed to update booking or find user details' }, { status: 200 });
        }

        const userEmail = updatedBooking.User_Booking_signerIdToUser.email;
        const ghlContact = await ghl.getContactByEmail(userEmail);

        if (ghlContact && ghlContact.id) {
          await ghl.removeTagsFromContact(ghlContact.id, ['status:payment_pending']);
          await ghl.addTagsToContact(ghlContact.id, ['status:payment_received', 'status:booking_confirmed']);
          console.log(`GHL: Tags updated for contact ${ghlContact.id} (Booking ${bookingId})`);
        } else {
          console.warn(`GHL: Contact not found for email ${userEmail} (Booking ${bookingId}). Tags not updated.`);
        }

        // 4. Send Booking Confirmation Email & SMS
        try {
          const clientDetails = {
            firstName: updatedBooking.User_Booking_signerIdToUser.name,
            email: updatedBooking.User_Booking_signerIdToUser.email,
          };
          const bookingDetailsForEmail = {
            bookingId: updatedBooking.id,
            serviceName: updatedBooking.service.name,
            date: updatedBooking.scheduledDateTime ? new Date(updatedBooking.scheduledDateTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD',
            time: updatedBooking.scheduledDateTime ? new Date(updatedBooking.scheduledDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'TBD',
            address: updatedBooking.addressStreet && updatedBooking.addressCity && updatedBooking.addressState && updatedBooking.addressZip ? 
              `${updatedBooking.addressStreet}, ${updatedBooking.addressCity}, ${updatedBooking.addressState} ${updatedBooking.addressZip}` : 'Address TBD',
            locationNotes: updatedBooking.locationNotes || undefined,
            numberOfSigners: 1,
            specialInstructions: updatedBooking.notes || undefined,
            bookingManagementLink: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/bookings`
          };

          const emailContent = bookingConfirmationEmail(clientDetails, bookingDetailsForEmail);
          await sendEmail({
            to: clientDetails.email,
            subject: emailContent.subject,
            html: emailContent.html,
          });
          console.log(`Booking confirmation email sent for bookingId: ${bookingId}`);

          if (ghlContact && ghlContact.phone && updatedBooking.User_Booking_signerIdToUser.email) {
            const userEmailForSmsConsent = updatedBooking.User_Booking_signerIdToUser.email;
            
            if (userEmailForSmsConsent) {
                const hasSmsConsent = await checkSmsConsent(userEmailForSmsConsent);
                if (hasSmsConsent) {
                    const bookingDetailsForSms = {
                        serviceName: updatedBooking.service.name,
                        date: updatedBooking.scheduledDateTime ? new Date(updatedBooking.scheduledDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD',
                        time: updatedBooking.scheduledDateTime ? new Date(updatedBooking.scheduledDateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute:'2-digit', hour12: true }).toLowerCase() : 'TBD',
                    };
                    const smsMessage = bookingConfirmationSms({ firstName: clientDetails.firstName }, bookingDetailsForSms);
                    const smsResult = await newSendSms({ to: ghlContact.phone, body: smsMessage });
                    if (smsResult.success) {
                        console.log(`Booking confirmation SMS sent successfully for bookingId: ${bookingId}`);
                    } else {
                        console.error(`Failed to send booking confirmation SMS for bookingId: ${bookingId}: ${smsResult.error}`);
                    }
                } else {
                    console.log(`User ${userEmailForSmsConsent} has not consented to SMS. Booking confirmation SMS not sent for bookingId: ${bookingId}`);
                }
            } else {
                console.warn(`Cannot check SMS consent for bookingId: ${bookingId} due to missing user email.`);
            }
          } else {
            console.warn(`SMS not sent for bookingId: ${bookingId}. Missing phone number (from GHL) or email for consent check.`);
          }

        } catch (notificationError: any) {
          console.error(`Error sending notifications for bookingId ${bookingId}: ${notificationError.message}`, notificationError);
        }

      } catch (dbOrGhlError: any) {
        console.error(`Stripe webhook processing error for bookingId ${bookingId}, PI ${paymentIntentId}: ${dbOrGhlError.message}`, dbOrGhlError);
        return NextResponse.json({ received: true, error: 'Internal processing error during DB/GHL update' }, { status: 200 });
      }
      break;

    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
      const failedPaymentIntentId = paymentIntentFailed.id;
      const failureReason = paymentIntentFailed.last_payment_error?.message;
      console.log('Stripe Event: payment_intent.payment_failed, ID:', failedPaymentIntentId, 'Reason:', failureReason);

      const failedBookingId = paymentIntentFailed.metadata?.bookingId;

      if (!failedBookingId) {
        console.error('Stripe webhook error: bookingId missing in payment_intent.payment_failed metadata for PI:', failedPaymentIntentId);
        return NextResponse.json({ received: true, error: 'Missing bookingId in metadata for failed payment' }, { status: 200 });
      }

      try {
        const updatedFailedPayment = await prisma.payment.updateMany({
          where: {
            paymentIntentId: failedPaymentIntentId,
            Booking: { id: failedBookingId },
          },
          data: {
            status: PaymentStatus.FAILED,
            notes: failureReason ? `Stripe: ${failureReason}` : 'Stripe: Payment failed without specific reason.',
          },
        });

        if (updatedFailedPayment.count === 0) {
          console.warn(`Stripe webhook: No payment record found or updated for failed PI: ${failedPaymentIntentId}, bookingId: ${failedBookingId}.`);
        }

        const updatedFailedBooking = await prisma.booking.update({
          where: { id: failedBookingId },
          data: { status: BookingStatus.CANCELLED_BY_CLIENT },
          include: { 
            User_Booking_signerIdToUser: { select: { email: true, name: true } },
            service: { select: { name: true } },
          },
        });

        if (!updatedFailedBooking || !updatedFailedBooking.User_Booking_signerIdToUser?.email || !updatedFailedBooking.User_Booking_signerIdToUser.name) {
          console.error(`Stripe webhook: Failed to update booking to CANCELLED_BY_CLIENT or retrieve user details for bookingId: ${failedBookingId}`);
        }

        let ghlContactFailed = null;
        if (updatedFailedBooking?.User_Booking_signerIdToUser?.email) {
          const userEmailFailed = updatedFailedBooking.User_Booking_signerIdToUser.email;
          ghlContactFailed = await ghl.getContactByEmail(userEmailFailed);

          if (ghlContactFailed && ghlContactFailed.id) {
            await ghl.removeTagsFromContact(ghlContactFailed.id, ['status:payment_pending']);
            await ghl.addTagsToContact(ghlContactFailed.id, ['status:payment_failed']);
            console.log(`GHL: Tags updated for payment failure for contact ${ghlContactFailed.id} (Booking ${failedBookingId})`);
          } else {
            console.warn(`GHL: Contact not found for email ${userEmailFailed} (Booking ${failedBookingId}) during payment failure. Tags not updated.`);
          }
        } else {
            console.warn(`GHL: Could not update tags for booking ${failedBookingId} due to missing user email.`);
        }

        if (updatedFailedBooking?.User_Booking_signerIdToUser?.email && updatedFailedBooking?.User_Booking_signerIdToUser?.name) {
          try {
            const clientDetails = {
              firstName: updatedFailedBooking.User_Booking_signerIdToUser.name,
              email: updatedFailedBooking.User_Booking_signerIdToUser.email,
            };
            const bookingDetailsForEmail = {
              bookingId: updatedFailedBooking.id,
              serviceName: updatedFailedBooking.service.name,
              date: updatedFailedBooking.scheduledDateTime ? new Date(updatedFailedBooking.scheduledDateTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD',
              time: updatedFailedBooking.scheduledDateTime ? new Date(updatedFailedBooking.scheduledDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'TBD',
            };
            const paymentAttemptDetails = {
              failureReason: failureReason || "Your bank declined the payment. Please try a different card or contact your bank.",
              nextStepsLink: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/${failedBookingId}/payment`
            };

            const emailContent = paymentFailedEmail(clientDetails, bookingDetailsForEmail, paymentAttemptDetails);
            await sendEmail({
              to: clientDetails.email,
              subject: emailContent.subject,
              html: emailContent.html,
            });
            console.log(`Payment failed email sent for bookingId: ${failedBookingId}`);

            if (ghlContactFailed && ghlContactFailed.phone && updatedFailedBooking.User_Booking_signerIdToUser.email) {
              const userEmailForSmsConsent = updatedFailedBooking.User_Booking_signerIdToUser.email;

              if (userEmailForSmsConsent) {
                const hasSmsConsent = await checkSmsConsent(userEmailForSmsConsent);
                if (hasSmsConsent) {
                  const smsMessage = paymentFailedSms({ firstName: clientDetails.firstName }, updatedFailedBooking.id);
                  const smsResult = await newSendSms({ to: ghlContactFailed.phone, body: smsMessage });
                  if (smsResult.success) {
                    console.log(`Payment failed SMS sent successfully for bookingId: ${failedBookingId}`);
                  } else {
                    console.error(`Failed to send payment failed SMS for bookingId: ${failedBookingId}: ${smsResult.error}`);
                  }
                } else {
                  console.log(`User ${userEmailForSmsConsent} has not consented to SMS. Payment failed SMS not sent for bookingId: ${failedBookingId}`);
                }
              } else {
                  console.warn(`Cannot check SMS consent for payment failed SMS for bookingId: ${failedBookingId} due to missing user email.`);
              }
            } else {
              console.warn(`Payment failed SMS not sent for bookingId: ${failedBookingId}. Missing phone number (from GHL) or email for consent check.`);
            }

          } catch (notificationError: any) {
            console.error(`Error sending payment failed notifications for bookingId ${failedBookingId}: ${notificationError.message}`, notificationError);
          }
        } else {
          console.warn(`Could not send payment failed notifications for booking ${failedBookingId} due to missing user email or first name.`);
        }

      } catch (dbOrGhlError: any) {
        console.error(`Stripe webhook processing error for failed payment, bookingId ${failedBookingId}, PI ${failedPaymentIntentId}: ${dbOrGhlError.message}`, dbOrGhlError);
        return NextResponse.json({ received: true, error: 'Internal processing error during failed payment DB/GHL update' }, { status: 200 });
      }
      break;

    default:
      console.log(`Stripe Webhook: Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
