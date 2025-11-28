import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { NotificationService } from "@/lib/notifications";
import { NotificationMethod, NotificationType } from "@/lib/prisma-types";
import { withAdminSecurity } from "@/lib/security/comprehensive-security";
import { getErrorMessage } from "@/lib/utils/error-utils";

const notificationMap: Record<string, NotificationType> = {
  APPOINTMENT_REMINDER: NotificationType.APPOINTMENT_REMINDER_24HR,
  PAYMENT_REMINDER: NotificationType.PAYMENT_REMINDER,
  BOOKING_NUDGE: NotificationType.BOOKING_CONFIRMATION,
  BOOKING_CONFIRMATION: NotificationType.BOOKING_CONFIRMATION,
  MISSED_CALL_FOLLOWUP: NotificationType.NO_SHOW_CHECK,
};

export const POST = withAdminSecurity(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const body = await request.json();
    const action: "approve" | "reject" = body?.action;

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const review = await prisma.messageReview.findUnique({
      where: { id: params.id },
      include: {
        message: true,
      },
    });

    if (!review || review.status !== "PENDING" || !review.message) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (action === "reject") {
      await prisma.$transaction([
        prisma.messageReview.update({
          where: { id: review.id },
          data: {
            status: "REJECTED",
          },
        }),
        prisma.outboundMessage.update({
          where: { id: review.messageId },
          data: {
            status: "CANCELLED",
            updatedAt: new Date(),
          },
        }),
      ]);

      return NextResponse.json({ success: true });
    }

    if (!review.message.recipientEmail) {
      return NextResponse.json({ error: "Message has no recipient email" }, { status: 400 });
    }

    const notificationType =
      notificationMap[review.message.messageType] ?? NotificationType.BOOKING_CONFIRMATION;

    const sendResult = await NotificationService.sendNotification({
      bookingId: review.message.bookingId ?? "",
      type: notificationType,
      recipient: {
        email: review.message.recipientEmail,
      },
      content: {
        subject: review.message.subject ?? "Houston Mobile Notary Pros",
        message: review.message.body,
      },
      methods: [NotificationMethod.EMAIL],
      skipDuplicateCheck: true,
    });

    await prisma.$transaction([
      prisma.messageReview.update({
        where: { id: review.id },
        data: {
          status: sendResult.success ? "APPROVED" : "REJECTED",
          reviewedAt: new Date(),
        },
      }),
      prisma.outboundMessage.update({
        where: { id: review.messageId },
        data: {
          status: sendResult.success ? "SENT" : "FAILED",
          sentAt: sendResult.success ? new Date() : undefined,
          errorMessage: sendResult.success
            ? undefined
            : sendResult.results.map((r) => r.error).filter(Boolean).join(", "),
        },
      }),
    ]);

    return NextResponse.json({
      success: sendResult.success,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
});

