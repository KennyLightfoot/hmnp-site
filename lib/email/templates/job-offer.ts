import { sendEmail } from '@/lib/email'

export interface JobOfferEmailData {
  notaryName: string
  notaryEmail: string
  bookingId: string
  serviceName: string
  scheduledDateTime: string
  location: string
  price: number
  expiresInMinutes: number
}

/**
 * Send job offer notification to notary
 */
export async function sendJobOfferNotification(data: JobOfferEmailData) {
  const subject = `New Job Offer: ${data.serviceName}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Job Offer</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">New Job Offer Available</h1>
      </div>
      <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px;">
        <p>Hi ${data.notaryName},</p>
        <p>A new job offer is available and matches your service area!</p>
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Job Details</h3>
          <p><strong>Service:</strong> ${data.serviceName}</p>
          <p><strong>Scheduled:</strong> ${data.scheduledDateTime}</p>
          <p><strong>Location:</strong> ${data.location}</p>
          <p><strong>Price:</strong> $${data.price.toFixed(2)}</p>
          <p style="color: #dc2626; font-weight: bold;">⏰ Offer expires in ${data.expiresInMinutes} minutes</p>
        </div>
        <div style="margin-top: 20px;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com'}/notary/job-offers" 
             style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
            View & Accept Offer
          </a>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          This is a first-come-first-serve offer. The first notary to accept will be assigned to this booking.
        </p>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: data.notaryEmail,
    subject,
    html,
  })
}

