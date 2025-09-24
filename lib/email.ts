import { Resend } from "resend"

// Only instantiate Resend when an API key is provided to avoid build-time crashes
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null as unknown as InstanceType<typeof Resend>

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
  text?: string
}

export async function sendEmail(options: EmailOptions) {
  const {
    to,
    subject,
    html,
    text,
    from = process.env.FROM_EMAIL || "notifications@houstonmobilenotarypros.com",
  } = options

  // Skip sending in environments without a configured API key
  if (!resend) {
    console.warn("sendEmail skipped – RESEND_API_KEY not set")
    return { success: false, error: new Error("Resend not configured") }
  }

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML tags for text version
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("Email sending error:", error)
    return { success: false, error }
  }
}
