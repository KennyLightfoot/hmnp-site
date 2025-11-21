import { sendEmail } from '@/lib/email'

export interface NotaryApplicationEmailData {
  firstName: string
  lastName: string
  email: string
  applicationId: string
}

export interface AdminNotificationData {
  applicationId: string
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  statesLicensed: string[]
  serviceTypes: string[]
}

/**
 * Send confirmation email to applicant
 */
export async function sendApplicationConfirmationEmail(data: NotaryApplicationEmailData) {
  const subject = 'Application Received - Houston Mobile Notary Pros'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Received</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Application Received</h1>
      </div>
      <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px;">
        <p>Hi ${data.firstName},</p>
        <p>Thank you for your interest in joining the Houston Mobile Notary Pros network!</p>
        <p>We've received your application and our team will review it shortly. You'll hear from us within 2-3 business days.</p>
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <p style="margin: 0;"><strong>Application ID:</strong> ${data.applicationId.slice(0, 8)}</p>
        </div>
        <p>If you have any questions in the meantime, please don't hesitate to reach out.</p>
        <p>Best regards,<br>Houston Mobile Notary Pros Team</p>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: data.email,
    subject,
    html,
  })
}

/**
 * Send notification email to admin about new application
 */
export async function sendAdminApplicationNotification(data: AdminNotificationData) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@houstonmobilenotarypros.com'
  const subject = `New Notary Application: ${data.applicantName}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Notary Application</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
        <h2 style="margin: 0 0 10px 0;">New Notary Application</h2>
        <p style="margin: 0;">A new application has been submitted and requires review.</p>
      </div>
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
        <h3>Applicant Information</h3>
        <p><strong>Name:</strong> ${data.applicantName}</p>
        <p><strong>Email:</strong> ${data.applicantEmail}</p>
        <p><strong>Phone:</strong> ${data.applicantPhone}</p>
        <p><strong>States Licensed:</strong> ${data.statesLicensed.join(', ')}</p>
        <p><strong>Service Types:</strong> ${data.serviceTypes.join(', ')}</p>
        <div style="margin-top: 20px;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com'}/admin/notary-applications/${data.applicationId}" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review Application
          </a>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: adminEmail,
    subject,
    html,
  })
}

