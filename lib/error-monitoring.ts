import { logError } from "./error-logger"

/**
 * Initialize global error monitoring
 * Call this function in your app's entry point
 */
export function initErrorMonitoring() {
  if (typeof window !== "undefined") {
    // Capture unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      logError(event.reason || "Unhandled Promise Rejection", {
        severity: "error",
        context: {
          type: "unhandledrejection",
          promise: event.promise,
        },
        tags: ["unhandled", "promise-rejection"],
      })
    })

    // Capture uncaught exceptions
    window.addEventListener("error", (event) => {
      logError(event.error || event.message, {
        severity: "error",
        context: {
          type: "uncaught-exception",
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        tags: ["unhandled", "exception"],
      })
    })
  }
}
