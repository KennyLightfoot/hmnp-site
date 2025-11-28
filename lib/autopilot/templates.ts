import { format } from "date-fns";

type TemplateContext = {
  customerName?: string | null;
  serviceName?: string | null;
  scheduledDate?: Date | null;
};

function firstName(name?: string | null) {
  if (!name) return "there";
  return name.split(" ")[0] || "there";
}

export function buildAppointmentReminderTemplate(ctx: TemplateContext): { subject: string; body: string } {
  const when = ctx.scheduledDate ? format(ctx.scheduledDate, "eeee, MMM d 'at' h:mma") : "your scheduled time";
  return {
    subject: "Your upcoming notary appointment",
    body: [
      `Hi ${firstName(ctx.customerName)},`,
      "",
      `Friendly reminder that your ${ctx.serviceName ?? "notary"} appointment is scheduled for ${when}.`,
      "Reply to this email if you need to reschedule or have any questions. We're here to help.",
      "",
      "— Houston Mobile Notary Pros",
    ].join("\n"),
  };
}

export function buildPaymentReminderTemplate(ctx: TemplateContext): { subject: string; body: string } {
  return {
    subject: "Action needed: complete your booking payment",
    body: [
      `Hi ${firstName(ctx.customerName)},`,
      "",
      "Thanks for choosing Houston Mobile Notary Pros. We still need your payment to lock in your appointment.",
      "You can complete it online in less than two minutes. Let us know if you need the link resent or have any issues.",
      "",
      "Once payment is confirmed, we’ll dispatch the best notary for your request.",
      "",
      "— Houston Mobile Notary Pros",
    ].join("\n"),
  };
}

export function buildBookingNudgeTemplate(ctx: TemplateContext): { subject: string; body: string } {
  return {
    subject: "Need help finishing your booking?",
    body: [
      `Hi ${firstName(ctx.customerName)},`,
      "",
      "It looks like you started a notary booking but didn’t finish. We can hold your spot if you complete the last step now.",
      "Hit reply if you'd rather finish over the phone—our team can help in just a few minutes.",
      "",
      "— Houston Mobile Notary Pros",
    ].join("\n"),
  };
}

