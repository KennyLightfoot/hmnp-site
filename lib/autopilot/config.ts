export type AutopilotScenario = "APPOINTMENT_REMINDER" | "PAYMENT_REMINDER" | "BOOKING_NUDGE";

export interface AutopilotFlags {
  appointmentReminders: boolean;
  paymentReminders: boolean;
  bookingNudges: boolean;
}

export function getAutopilotFlags(): AutopilotFlags {
  return {
    appointmentReminders: process.env.AI_AUTOPILOT_APPOINTMENT_REMINDERS === "true",
    paymentReminders: process.env.AI_AUTOPILOT_PAYMENT_REMINDERS === "true",
    bookingNudges: process.env.AI_AUTOPILOT_BOOKING_NUDGES === "true",
  };
}

export const AUTOPILOT_DEFAULT_FLAGS: AutopilotFlags = {
  appointmentReminders: false,
  paymentReminders: false,
  bookingNudges: false,
};

