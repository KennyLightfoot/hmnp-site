import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { sendSms, checkSmsConsent } from '@/lib/sms';
import * as ghl from '@/lib/ghl';
import { BookingStatus } from '@prisma/client';

// This endpoint will be called by a scheduler to send post-service follow-ups

export async function POST(request: Request) {
  try {
    // Verify the request is from our scheduler
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Running post-service follow-up job');
    
    // Find bookings completed approximately 24 hours ago
    const now = new Date();
    const targetTime = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 24 hours ago
    const windowStart = new Date(targetTime.getTime() - (2 * 60 * 60 * 1000)); // 2 hours before target
    const windowEnd = new Date(targetTime.getTime() + (2 * 60 * 60 * 1000)); // 2 hours after target

    // Find completed bookings from ~24 hours ago
    const completedBookings = await prisma.Booking.findMany({
      where: {
        status: BookingStatus.COMPLETED,
        // Use actualEndDateTime if available, otherwise fall back to scheduledDateTime
        OR: [
          {
            actualEndDateTime: {
              gte: windowStart,
              lte: windowEnd,
            },
          },
          {
            actualEndDateTime: null,
            scheduledDateTime: {
              gte: windowStart,
              lte: windowEnd,
            },
          },
        ],
        // Add logic to prevent duplicate follow-ups if needed
        // For now, we'll assume no duplicate prevention mechanism exists
      },
      include: {
        User_Booking_signerIdToUser: {
          select: { email: true, name: true },
        },
        Service: {
          select: { name: true },
        },
      },
    });

    console.log(`Found ${completedBookings.length} completed bookings needing follow-up`);

    const results = {
      processed: 0,
      emailsSent: 0,
      smsSent: 0,
      errors: [] as string[],
    };

    for (const booking of completedBookings) {
      try {
        results.processed++;

        if (!booking.User_Booking_signerIdToUser?.email || !booking.User_Booking_signerIdToUser?.name) {
          results.errors.push(`Booking ${booking.id}: Missing user email or name`);
          continue;
        }

        const clientDetails = {
          firstName: booking.User_Booking_signerIdToUser.name,
          email: booking.User_Booking_signerIdToUser.email,
        };

        // Prepare booking details for templates
        const bookingDetails = {
          bookingId: booking.id,
          serviceName: booking.Service.name,
          completedDate: booking.actualEndDateTime || booking.scheduledDateTime,
        };

        // Generate feedback link - you can customize this
        const feedbackLink = process.env.FEEDBACK_FORM_URL || 
          `${process.env.NEXT_PUBLIC_BASE_URL}/feedback?booking=${booking.id}`;

        // Send follow-up email
        try {
          const emailContent = postServiceFollowUpEmail(clientDetails, bookingDetails, feedbackLink);
          await sendEmail({
            to: clientDetails.email,
            subject: emailContent.subject,
            html: emailContent.html,
          });
          results.emailsSent++;
          console.log(`Post-service follow-up email sent for booking ${booking.id}`);
        } catch (emailError: any) {
          console.error(`Failed to send post-service follow-up email for booking ${booking.id}:`, emailError);
          results.errors.push(`Booking ${booking.id}: Email error - ${emailError.message}`);
        }

        // Send follow-up SMS if user has consented
        try {
          const ghlContact = await ghl.getContactByEmail(clientDetails.email);
          
          if (ghlContact && ghlContact.phone) {
            const hasSmsConsent = await checkSmsConsent(clientDetails.email);
            
            if (hasSmsConsent) {
              // Create a shortened feedback link for SMS (you might want to use a URL shortener service)
              const feedbackLinkShort = feedbackLink; // For now, use the full link

              const { postServiceFollowUpSms } = await import('@/lib/sms/templates');
              const smsMessage = postServiceFollowUpSms(
                { firstName: clientDetails.firstName }, 
                feedbackLinkShort
              );

              const smsResult = await sendSms({ to: ghlContact.phone, body: smsMessage });
              
              if (smsResult.success) {
                results.smsSent++;
                console.log(`Post-service follow-up SMS sent for booking ${booking.id}`);
              } else {
                console.error(`Failed to send post-service follow-up SMS for booking ${booking.id}:`, smsResult.error);
                results.errors.push(`Booking ${booking.id}: SMS error - ${smsResult.error}`);
              }
            } else {
              console.log(`User ${clientDetails.email} has not consented to SMS. Post-service follow-up SMS skipped for booking ${booking.id}`);
            }
          } else {
            console.log(`No phone number found for ${clientDetails.email}. Post-service follow-up SMS skipped for booking ${booking.id}`);
          }
        } catch (smsError: any) {
          console.error(`Error processing post-service follow-up SMS for booking ${booking.id}:`, smsError);
          results.errors.push(`Booking ${booking.id}: SMS processing error - ${smsError.message}`);
        }

      } catch (bookingError: any) {
        console.error(`Error processing post-service follow-up for booking ${booking.id}:`, bookingError);
        results.errors.push(`Booking ${booking.id}: Processing error - ${bookingError.message}`);
      }
    }

    console.log('Post-service follow-up job completed:', results);

    return NextResponse.json({
      success: true,
      results,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in post-service follow-up job:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// Email template for post-service follow-up
function postServiceFollowUpEmail(
  client: { firstName: string; email: string },
  booking: { bookingId: string; serviceName: string; completedDate: Date | null },
  feedbackLink: string
) {
  const subject = 'Thank you for choosing Houston Mobile Notary Pros - We value your feedback';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Thank You for Your Business!</h2>
      <p>Hi ${client.firstName},</p>
      <p>Thank you for choosing Houston Mobile Notary Pros for your recent notary service. We hope everything went smoothly and that you're satisfied with our professional service.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Service Details:</h3>
        <p><strong>Service:</strong> ${booking.serviceName}</p>
        <p><strong>Date Completed:</strong> ${booking.completedDate ? new Date(booking.completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}</p>
        <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <h3>How did we do?</h3>
        <p>Your feedback helps us continue to provide excellent service to our clients.</p>
        <a href="${feedbackLink}" style="display: inline-block; background-color: #007bff; color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold;">Leave Feedback</a>
      </div>
      
      <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px;">
        <h3>Need our services again?</h3>
        <p>We're here whenever you need professional notary services. Visit our website to schedule your next appointment or refer us to friends and family.</p>
        <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}">Schedule Another Appointment</a></p>
      </div>
      
      <p style="margin-top: 30px;">Best regards,<br>The Houston Mobile Notary Pros Team</p>
      
      <div style="font-size: 12px; color: #6c757d; margin-top: 30px; border-top: 1px solid #e9ecef; padding-top: 15px;">
        <p>If you have any questions or concerns about your recent service, please don't hesitate to contact us directly.</p>
      </div>
    </div>
  `;

  return { subject, html };
} 