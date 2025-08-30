interface ConfirmationEmailProps {
  booking: {
    id: string
    customerName: string
    serviceName: string
    scheduledDateTime: string
    addressStreet: string
    addressCity: string
    addressState: string
    addressZip: string
    totalPaid: number
    urgencyLevel: string
    notes?: string
    locationNotes?: string
  }
}

export function ConfirmationEmailTemplate({ booking }: ConfirmationEmailProps) {
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    }
  }

  const dateTime = formatDateTime(booking.scheduledDateTime)

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#A52A2A", color: "white", padding: "20px", textAlign: "center" }}>
        <h1 style={{ margin: "0", fontSize: "24px" }}>Houston Mobile Notary Pros</h1>
        <p style={{ margin: "5px 0 0 0", fontSize: "16px" }}>Appointment Confirmed</p>
      </div>

      {/* Content */}
      <div style={{ padding: "30px 20px", backgroundColor: "#ffffff" }}>
        <h2 style={{ color: "#333", marginBottom: "20px" }}>Hello {booking.customerName},</h2>

        <p style={{ color: "#666", lineHeight: "1.6", marginBottom: "25px" }}>
          Your notary appointment has been confirmed! Here are the details:
        </p>

        {/* Appointment Details */}
        <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "8px", marginBottom: "25px" }}>
          <h3 style={{ color: "#A52A2A", marginTop: "0", marginBottom: "15px" }}>Appointment Details</h3>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold", color: "#333" }}>Service:</td>
              <td style={{ padding: "8px 0", color: "#666" }}>{booking.serviceName}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold", color: "#333" }}>Date:</td>
              <td style={{ padding: "8px 0", color: "#666" }}>{dateTime.date}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold", color: "#333" }}>Time:</td>
              <td style={{ padding: "8px 0", color: "#666" }}>{dateTime.time}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold", color: "#333" }}>Location:</td>
              <td style={{ padding: "8px 0", color: "#666" }}>
                {booking.addressStreet}
                <br />
                {booking.addressCity}, {booking.addressState} {booking.addressZip}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold", color: "#333" }}>Priority:</td>
              <td style={{ padding: "8px 0", color: "#666" }}>
                {booking.urgencyLevel.charAt(0).toUpperCase() + booking.urgencyLevel.slice(1)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold", color: "#333" }}>Total Paid:</td>
              <td style={{ padding: "8px 0", color: "#A52A2A", fontWeight: "bold" }}>
                ${booking.totalPaid.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold", color: "#333" }}>Booking ID:</td>
              <td style={{ padding: "8px 0", color: "#666", fontFamily: "monospace" }}>{booking.id}</td>
            </tr>
          </table>

          {booking.notes && (
            <div style={{ marginTop: "15px" }}>
              <strong style={{ color: "#333" }}>Special Instructions:</strong>
              <p style={{ color: "#666", margin: "5px 0 0 0" }}>{booking.notes}</p>
            </div>
          )}

          {booking.locationNotes && (
            <div style={{ marginTop: "15px" }}>
              <strong style={{ color: "#333" }}>Location Notes:</strong>
              <p style={{ color: "#666", margin: "5px 0 0 0" }}>{booking.locationNotes}</p>
            </div>
          )}
        </div>

        {/* What to Prepare */}
        <div style={{ marginBottom: "25px" }}>
          <h3 style={{ color: "#A52A2A", marginBottom: "15px" }}>What to Prepare</h3>
          <ul style={{ color: "#666", lineHeight: "1.6", paddingLeft: "20px" }}>
            <li>Valid government-issued photo ID (driver's license, passport, etc.)</li>
            <li>All documents that need to be notarized</li>
            <li>Any additional identification required for specific documents</li>
            <li>Payment for any additional services (if applicable)</li>
          </ul>
        </div>

        {/* Important Notes */}
        <div style={{ backgroundColor: "#fff3cd", padding: "15px", borderRadius: "8px", marginBottom: "25px" }}>
          <h4 style={{ color: "#856404", marginTop: "0", marginBottom: "10px" }}>Important Notes</h4>
          <ul style={{ color: "#856404", margin: "0", paddingLeft: "20px" }}>
            <li>Our notary will call you 30 minutes before arrival</li>
            <li>Please have all signers present at the appointment time</li>
            <li>Ensure all documents are complete and ready for signing</li>
            <li>If you need to reschedule, please call us at least 2 hours in advance</li>
          </ul>
        </div>

        {/* Contact Information */}
        <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
          <h3 style={{ color: "#A52A2A", marginTop: "0", marginBottom: "15px" }}>Questions or Need to Make Changes?</h3>
          <p style={{ color: "#666", margin: "0" }}>
            <strong>Phone:</strong>{" "}
            <a href="tel:7135550123" style={{ color: "#A52A2A" }}>
              (713) 555-0123
            </a>
            <br />
            <strong>Email:</strong>{" "}
            <a href="mailto:info@houstonmobilenotarypros.com" style={{ color: "#A52A2A" }}>
              info@houstonmobilenotarypros.com
            </a>
            <br />
            <strong>Hours:</strong> 7AM - 9PM Daily
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: "#002147", color: "white", padding: "20px", textAlign: "center" }}>
        <p style={{ margin: "0", fontSize: "14px" }}>
          Houston Mobile Notary Pros - Professional Mobile Notary Services
        </p>
        <p style={{ margin: "5px 0 0 0", fontSize: "12px", opacity: "0.8" }}>
          Licensed, Bonded & Insured • Serving Greater Houston Area
        </p>
      </div>
    </div>
  )
}
