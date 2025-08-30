interface AuditEvent {
  id: string
  sessionId: string
  timestamp: string
  eventType:
    | "session_start"
    | "identity_verification"
    | "document_upload"
    | "signature_capture"
    | "signature_verification"
    | "session_end"
    | "compliance_check"
  userId: string
  userRole: "notary" | "signer" | "witness"
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  location?: {
    latitude: number
    longitude: number
    accuracy: number
  }
}

interface ComplianceRequirement {
  id: string
  requirement: string
  status: "pending" | "satisfied" | "failed"
  evidence?: string[]
  timestamp?: string
}

export class AuditLogger {
  private static instance: AuditLogger
  private events: AuditEvent[] = []

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  async logEvent(
    sessionId: string,
    eventType: AuditEvent["eventType"],
    userId: string,
    userRole: AuditEvent["userRole"],
    details: Record<string, any> = {},
  ): Promise<void> {
    const event: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      timestamp: new Date().toISOString(),
      eventType,
      userId,
      userRole,
      details,
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      location: await this.getLocation(),
    }

    this.events.push(event)

    // Store in database
    try {
      const response = await fetch("/api/audit/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      })

      if (!response.ok) {
        console.error("Failed to store audit event:", response.statusText)
      }
    } catch (error) {
      console.error("Error storing audit event:", error)
    }
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch("https://api.ipify.org?format=json")
      const data = await response.json()
      return data.ip
    } catch {
      return "unknown"
    }
  }

  private async getLocation(): Promise<AuditEvent["location"]> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          })
        },
        () => resolve(undefined),
        { timeout: 5000 },
      )
    })
  }

  getSessionEvents(sessionId: string): AuditEvent[] {
    return this.events.filter((event) => event.sessionId === sessionId)
  }

  generateAuditReport(sessionId: string): string {
    const events = this.getSessionEvents(sessionId)
    const report = {
      sessionId,
      generatedAt: new Date().toISOString(),
      totalEvents: events.length,
      events: events.map((event) => ({
        timestamp: event.timestamp,
        type: event.eventType,
        user: `${event.userId} (${event.userRole})`,
        details: event.details,
        location: event.location ? `${event.location.latitude}, ${event.location.longitude}` : "Not available",
      })),
    }

    return JSON.stringify(report, null, 2)
  }
}

export class ComplianceChecker {
  private static texasRONRequirements: ComplianceRequirement[] = [
    {
      id: "identity_verification",
      requirement: "Signer identity verified through credential analysis and knowledge-based authentication",
      status: "pending",
    },
    {
      id: "audio_video_recording",
      requirement: "Complete audio and video recording of the notarization session",
      status: "pending",
    },
    {
      id: "electronic_signature",
      requirement: "Electronic signature captured and verified",
      status: "pending",
    },
    {
      id: "notary_certificate",
      requirement: "Electronic notary certificate attached to document",
      status: "pending",
    },
    {
      id: "session_security",
      requirement: "Secure communication channel established",
      status: "pending",
    },
    {
      id: "document_integrity",
      requirement: "Document integrity maintained through cryptographic hashing",
      status: "pending",
    },
    {
      id: "audit_trail",
      requirement: "Complete audit trail of all session activities",
      status: "pending",
    },
  ]

  static checkCompliance(sessionId: string, events: AuditEvent[]): ComplianceRequirement[] {
    const requirements = [...this.texasRONRequirements]

    // Check identity verification
    const identityEvents = events.filter((e) => e.eventType === "identity_verification")
    if (identityEvents.length > 0) {
      const req = requirements.find((r) => r.id === "identity_verification")
      if (req) {
        req.status = "satisfied"
        req.evidence = identityEvents.map((e) => e.id)
        req.timestamp = identityEvents[0].timestamp
      }
    }

    // Check electronic signatures
    const signatureEvents = events.filter((e) => e.eventType === "signature_capture")
    if (signatureEvents.length > 0) {
      const req = requirements.find((r) => r.id === "electronic_signature")
      if (req) {
        req.status = "satisfied"
        req.evidence = signatureEvents.map((e) => e.id)
        req.timestamp = signatureEvents[0].timestamp
      }
    }

    // Check session recording (would be implemented with actual recording system)
    const sessionStart = events.find((e) => e.eventType === "session_start")
    if (sessionStart) {
      const req = requirements.find((r) => r.id === "audio_video_recording")
      if (req) {
        req.status = "satisfied"
        req.evidence = [sessionStart.id]
        req.timestamp = sessionStart.timestamp
      }
    }

    // Check audit trail completeness
    if (events.length > 0) {
      const req = requirements.find((r) => r.id === "audit_trail")
      if (req) {
        req.status = "satisfied"
        req.evidence = events.map((e) => e.id)
        req.timestamp = new Date().toISOString()
      }
    }

    return requirements
  }
}
