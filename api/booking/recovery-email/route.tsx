import { type NextRequest, NextResponse } from "next/server"

interface BookingData {
  serviceType?: string
  location?: string
  datetime?: string
  customerInfo?: {
    name?: string
    email?: string
    phone?: string
  }
  timestamp: number
}

export async function POST(request: NextRequest) {
  try {
    const bookingData: BookingData = await request.json()

    if (!bookingData.customerInfo?.email) {
      return NextResponse.json({ error: "Email address required" }, { status: 400 })
    }

    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #91a3b0; color: white; padding: 20px; text-align: center;">
          <h1>Don't Forget Your Notary Appointment!</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <p>Hi ${bookingData.customerInfo.name || "there"},</p>
          
          <p>We noticed you started booking a ${bookingData.serviceType || "notary service"} but didn't complete your appointment. We're here to help!</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #a52a2a; margin-top: 0;">Special Offer: $10 OFF</h3>
            <p>Complete your booking in the next 24 hours and save $10 on your first service.</p>
            <p><strong>Use code: SAVE10</strong></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/booking" 
               style="background: #a52a2a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Complete Your Booking
            </a>
          </div>
          
          <p>Or call us directly at <strong>(713) 555-0123</strong> - we're available 7AM-9PM daily.</p>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <h4>Why Choose Houston Mobile Notary Pros?</h4>
            <ul>
              <li>Licensed & insured notaries</li>
              <li>Same-day service available</li>
              <li>We come to you - no travel required</li>
              <li>RON services available 24/7</li>
            </ul>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666;">
          <p>Houston Mobile Notary Pros<br>
          Professional Mobile Notary Services<br>
          (713) 555-0123</p>
        </div>
      </div>
    `

    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: bookingData.customerInfo.email,
        subject: "Complete Your Notary Booking - $10 OFF Inside!",
        html: emailTemplate,
        from: process.env.FROM_EMAIL || "noreply@houstonmobilenotarypros.com",
      }),
    })

    if (!emailResponse.ok) {
      throw new Error("Failed to send recovery email")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Recovery email error:", error)
    return NextResponse.json({ error: "Failed to send recovery email" }, { status: 500 })
  }
}
