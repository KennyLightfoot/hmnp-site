type ErrorSeverity = "info" | "warning" | "error" | "critical"

interface ErrorLogOptions {
  severity?: ErrorSeverity
  context?: Record<string, any>
  user?: string | null
  tags?: string[]
  sendToService?: boolean
}

/**
 * Centralized error logging utility
 * This can be expanded to send errors to external services like Sentry
 */
export function logError(error: Error | string, options: ErrorLogOptions = {}) {
  const {
    severity = "error",
    context = {},
    user = null,
    tags = [],
    sendToService = process.env.NODE_ENV === "production",
  } = options

  // Create structured error object
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: typeof error === "string" ? error : error.message,
    stack: error instanceof Error ? error.stack : undefined,
    severity,
    context,
    user,
    tags,
    environment: process.env.NODE_ENV || "development",
    url: typeof window !== "undefined" ? window.location.href : undefined,
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
  }

  // Log to console with appropriate level
  switch (severity) {
    case "info":
      console.info(`[INFO] ${errorLog.message}`, errorLog)
      break
    case "warning":
      console.warn(`[WARNING] ${errorLog.message}`, errorLog)
      break
    case "critical":
      console.error(`[CRITICAL] ${errorLog.message}`, errorLog)
      break
    case "error":
    default:
      console.error(`[ERROR] ${errorLog.message}`, errorLog)
  }

  // In production, send to error monitoring service
  if (sendToService) {
    // This is where you would integrate with services like Sentry, LogRocket, etc.
    // Example for Sentry (you would need to install @sentry/nextjs):
    //
    // import * as Sentry from '@sentry/nextjs';
    //
    // Sentry.captureException(error, {
    //   level: severity,
    //   tags,
    //   user: user ? { id: user } : undefined,
    //   extra: context
    // });

    // For now, we'll just log that we would send to a service
    console.info("Would send error to monitoring service:", errorLog)
  }

  return errorLog
}

/**
 * Log API errors with consistent formatting
 */
export function logApiError(
  endpoint: string,
  error: Error | string,
  request?: Request,
  additionalContext: Record<string, any> = {},
) {
  const context = {
    endpoint,
    method: request?.method,
    url: request?.url,
    headers: Object.fromEntries(request?.headers || []),
    ...additionalContext,
  }

  return logError(error, {
    severity: "error",
    context,
    tags: ["api", endpoint],
  })
}

/**
 * Log form submission errors
 */
export function logFormError(formName: string, error: Error | string, formData?: Record<string, any>) {
  // Remove sensitive data before logging
  const sanitizedFormData = formData ? sanitizeFormData(formData) : undefined

  return logError(error, {
    severity: "warning",
    context: {
      form: formName,
      formData: sanitizedFormData,
    },
    tags: ["form", formName],
  })
}

/**
 * Remove sensitive data from form data before logging
 */
function sanitizeFormData(formData: Record<string, any>): Record<string, any> {
  const sensitiveFields = ["password", "token", "credit", "card", "cvv", "ssn", "social"]
  const sanitized = { ...formData }

  Object.keys(sanitized).forEach((key) => {
    const lowerKey = key.toLowerCase()
    if (sensitiveFields.some((field) => lowerKey.includes(field))) {
      sanitized[key] = "[REDACTED]"
    }
  })

  return sanitized
}
