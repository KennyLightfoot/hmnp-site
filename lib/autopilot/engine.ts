import { addHours } from "date-fns";

import { prisma } from "@/lib/db";
import { NotificationService } from "@/lib/notifications";
import { NotificationMethod, NotificationType, BookingStatus } from "@/lib/prisma-types";
import { getAutopilotFlags, AUTOPILOT_DEFAULT_FLAGS } from "./config";
import {
  buildAppointmentReminderTemplate,
  buildBookingNudgeTemplate,
  buildPaymentReminderTemplate,
} from "./templates";

type AutopilotScenario = "APPOINTMENT_REMINDER" | "PAYMENT_REMINDER" | "BOOKING_NUDGE";

export interface AutopilotRunSummary {
  scenario: AutopilotScenario;
  queued: number;
  sent: number;
  failed: number;
  skipped: number;
}

export interface AutopilotRunResult {
  summaries: AutopilotRunSummary[];
  totalQueued: number;
  totalSent: number;
  totalFailed: number;
  flags: ReturnType<typeof getAutopilotFlags>;
}

async function ensureOutboundMessage(
  bookingId: string,
  messageType: AutopilotScenario,
  templateKey: string,
  recipientEmail: string,
  subject: string,
  body: string,
) {
  return prisma.outboundMessage.create({
    data: {
      bookingId,
      messageType,
      templateKey,
      riskLevel: "LOW",
      channel: "EMAIL",
      recipientEmail,
      subject,
      body,
      metadata: {
        autopilot: true,
      },
    },
  });
}

async function updateOutboundStatus(id: string, status: "SENT" | "FAILED", errorMessage?: string) {
  await prisma.outboundMessage.update({
    where: { id },
    data: {
      status,
      sentAt: status === "SENT" ? new Date() : undefined,
      errorMessage,
    },
  });
}

async function hasRecentMessage(bookingId: string, messageType: AutopilotScenario) {
  const twentyFourHoursAgo = addHours(new Date(), -24);
  const existing = await prisma.outboundMessage.findFirst({
    where: {
      bookingId,
      messageType,
      createdAt: {
        gte: twentyFourHoursAgo,
      },
      status: {
        in: ["PENDING", "SENT"],
      },
    },
  });
  return Boolean(existing);
}

async function processAppointmentReminders(): Promise<AutopilotRunSummary> {
  const now = new Date();
  const in24h = addHours(now, 24);

  const bookings = await prisma.booking.findMany({
    where: {
      scheduledDateTime: {
        gte: now,
        lte: in24h,
      },
      reminder24hrSentAt: null,
      customerEmail: { not: null },
      status: {
        in: [BookingStatus.CONFIRMED, BookingStatus.SCHEDULED],
      },
    },
    select: {
      id: true,
      customerName: true,
      customerEmail: true,
      scheduledDateTime: true,
      service: {
        select: {
          name: true,
        },
      },
    },
  });

  const summary: AutopilotRunSummary = {
    scenario: "APPOINTMENT_REMINDER",
    queued: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  };

  for (const booking of bookings) {
    if (!booking.customerEmail) {
      summary.skipped++;
      continue;
    }

    const duplicate = await hasRecentMessage(booking.id, "APPOINTMENT_REMINDER");
    if (duplicate) {
      summary.skipped++;
      continue;
    }

    const template = buildAppointmentReminderTemplate({
      customerName: booking.customerName,
      serviceName: booking.service?.name,
      scheduledDate: booking.scheduledDateTime,
    });

    const outbound = await ensureOutboundMessage(
      booking.id,
      "APPOINTMENT_REMINDER",
      "appointment-reminder-24h",
      booking.customerEmail,
      template.subject,
      template.body,
    );

    summary.queued++;

    const sendResult = await NotificationService.sendNotification({
      bookingId: booking.id,
      type: NotificationType.APPOINTMENT_REMINDER_24HR,
      recipient: {
        email: booking.customerEmail,
        firstName: booking.customerName ?? undefined,
      },
      content: {
        subject: template.subject,
        message: template.body,
      },
      methods: [NotificationMethod.EMAIL],
      skipDuplicateCheck: true,
    });

    if (sendResult.success) {
      summary.sent++;
      await updateOutboundStatus(outbound.id, "SENT");
    } else {
      summary.failed++;
      const errorMessage = sendResult.results.map((r) => r.error).filter(Boolean).join(", ") || "Failed to send";
      await updateOutboundStatus(outbound.id, "FAILED", errorMessage);
    }
  }

  return summary;
}

async function processPaymentReminders(): Promise<AutopilotRunSummary> {
  const now = new Date();
  const bookings = await prisma.booking.findMany({
    where: {
      status: BookingStatus.PAYMENT_PENDING,
      customerEmail: { not: null },
      updatedAt: {
        lte: addHours(now, -6),
      },
    },
    select: {
      id: true,
      customerName: true,
      customerEmail: true,
      service: {
        select: {
          name: true,
        },
      },
    },
  });

  const summary: AutopilotRunSummary = {
    scenario: "PAYMENT_REMINDER",
    queued: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  };

  for (const booking of bookings) {
    if (!booking.customerEmail) {
      summary.skipped++;
      continue;
    }
    const duplicate = await hasRecentMessage(booking.id, "PAYMENT_REMINDER");
    if (duplicate) {
      summary.skipped++;
      continue;
    }

    const template = buildPaymentReminderTemplate({
      customerName: booking.customerName,
      serviceName: booking.service?.name,
    });

    const outbound = await ensureOutboundMessage(
      booking.id,
      "PAYMENT_REMINDER",
      "payment-reminder",
      booking.customerEmail,
      template.subject,
      template.body,
    );

    summary.queued++;

    const sendResult = await NotificationService.sendNotification({
      bookingId: booking.id,
      type: NotificationType.PAYMENT_REMINDER,
      recipient: {
        email: booking.customerEmail,
        firstName: booking.customerName ?? undefined,
      },
      content: {
        subject: template.subject,
        message: template.body,
      },
      methods: [NotificationMethod.EMAIL],
      skipDuplicateCheck: true,
    });

    if (sendResult.success) {
      summary.sent++;
      await updateOutboundStatus(outbound.id, "SENT");
    } else {
      summary.failed++;
      const errorMessage = sendResult.results.map((r) => r.error).filter(Boolean).join(", ") || "Failed to send";
      await updateOutboundStatus(outbound.id, "FAILED", errorMessage);
    }
  }

  return summary;
}

async function processBookingNudges(): Promise<AutopilotRunSummary> {
  const fourHoursAgo = addHours(new Date(), -4);
  const bookings = await prisma.booking.findMany({
    where: {
      status: BookingStatus.REQUESTED,
      createdAt: {
        lte: fourHoursAgo,
      },
      customerEmail: { not: null },
      confirmationEmailSentAt: null,
    },
    select: {
      id: true,
      customerName: true,
      customerEmail: true,
      service: {
        select: {
          name: true,
        },
      },
    },
  });

  const summary: AutopilotRunSummary = {
    scenario: "BOOKING_NUDGE",
    queued: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  };

  for (const booking of bookings) {
    if (!booking.customerEmail) {
      summary.skipped++;
      continue;
    }
    const duplicate = await hasRecentMessage(booking.id, "BOOKING_NUDGE");
    if (duplicate) {
      summary.skipped++;
      continue;
    }

    const template = buildBookingNudgeTemplate({
      customerName: booking.customerName,
      serviceName: booking.service?.name,
    });

    const outbound = await prisma.outboundMessage.create({
      data: {
        bookingId: booking.id,
        messageType: "BOOKING_NUDGE",
        templateKey: "booking-nudge",
        riskLevel: "MEDIUM",
        requiresReview: true,
        status: "REVIEW_REQUIRED",
        channel: "EMAIL",
        recipientEmail: booking.customerEmail,
        subject: template.subject,
        body: template.body,
        metadata: { autopilot: true, scenario: "BOOKING_NUDGE" },
      },
    });

    await prisma.messageReview.create({
      data: {
        messageId: outbound.id,
        scenario: "BOOKING_NUDGE",
        riskLevel: "MEDIUM",
      },
    });

    summary.queued++;
  }

  return summary;
}

export async function runAutopilot(): Promise<AutopilotRunResult> {
  const flags = getAutopilotFlags() ?? AUTOPILOT_DEFAULT_FLAGS;
  const summaries: AutopilotRunSummary[] = [];

  if (flags.appointmentReminders) {
    summaries.push(await processAppointmentReminders());
  }
  if (flags.paymentReminders) {
    summaries.push(await processPaymentReminders());
  }
  if (flags.bookingNudges) {
    summaries.push(await processBookingNudges());
  }

  return {
    summaries,
    totalQueued: summaries.reduce((sum, s) => sum + s.queued, 0),
    totalSent: summaries.reduce((sum, s) => sum + s.sent, 0),
    totalFailed: summaries.reduce((sum, s) => sum + s.failed, 0),
    flags,
  };
}

