import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  debug: false,
  tracesSampleRate: 1,
  beforeSend(event) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
  initialScope: {
    tags: {
      component: "server",
      environment: process.env.NODE_ENV,
    },
  },
}); 