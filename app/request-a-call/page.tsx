"use client"

import { PhoneCall, CalendarClock, TriangleAlert } from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

function CallRequestForm() {
  const searchParams = useSearchParams();
  const intent = (searchParams?.get("intent") || "").toLowerCase();
  const bookingIdParam = searchParams?.get("bookingId") || searchParams?.get("booking") || "";

  const initialFormState = useMemo(() => {
    const prefilledReason =
      searchParams?.get("callRequestReason") ||
      (intent === "reschedule"
        ? `Reschedule request${bookingIdParam ? ` for booking ${bookingIdParam}` : ""}`
        : intent === "cancel"
          ? `Cancellation request${bookingIdParam ? ` for booking ${bookingIdParam}` : ""}`
          : "");
    return {
      name: searchParams?.get("name") || "",
      email: searchParams?.get("email") || "",
      phone: searchParams?.get("phone") || "",
      preferredCallTime: searchParams?.get("preferredCallTime") || "",
      callRequestReason: prefilledReason,
      termsAccepted: false,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [form, setForm] = useState(initialFormState);
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message?: string }>({ type: "idle" });

  useEffect(() => {
    const prefilledReason =
      searchParams?.get("callRequestReason") ||
      (intent === "reschedule"
        ? `Reschedule request${bookingIdParam ? ` for booking ${bookingIdParam}` : ""}`
        : intent === "cancel"
          ? `Cancellation request${bookingIdParam ? ` for booking ${bookingIdParam}` : ""}`
          : form.callRequestReason);

    setForm((prev) => ({
      ...prev,
      name: searchParams?.get("name") || prev.name,
      email: searchParams?.get("email") || prev.email,
      phone: searchParams?.get("phone") || prev.phone,
      preferredCallTime: searchParams?.get("preferredCallTime") || prev.preferredCallTime,
      callRequestReason: prefilledReason || prev.callRequestReason,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ type: "loading" });
    // Basic validation
    if (!form.name || !form.email || !form.phone || !form.preferredCallTime || !form.callRequestReason || !form.termsAccepted) {
      setStatus({ type: "error", message: "Please fill in all fields and accept the terms." });
      return;
    }
    try {
      const res = await fetch("/api/request-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: "success", message: "Thank you! We'll call you back as soon as possible." });
        setForm({ name: "", email: "", phone: "", preferredCallTime: "", callRequestReason: "", termsAccepted: false });
      } else {
        setStatus({ type: "error", message: data.error || "Submission failed. Please try again." });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Submission failed. Please try again." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!!intent && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-semibold">
                {intent === "reschedule"
                  ? "We’ll help you reschedule your appointment."
                  : "We’ll help you cancel your appointment."}
              </p>
              {bookingIdParam && (
                <p className="mt-1 text-amber-700/90">
                  Reference booking ID <span className="font-mono text-xs">{bookingIdParam}</span> in your message so we can locate it fast.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <div>
        <label className="block font-medium mb-1" htmlFor="name">Full Name<span className="text-red-500">*</span></label>
        <input type="text" name="name" id="name" value={form.name} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block font-medium mb-1" htmlFor="email">Email<span className="text-red-500">*</span></label>
        <input type="email" name="email" id="email" value={form.email} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block font-medium mb-1" htmlFor="phone">Phone<span className="text-red-500">*</span></label>
        <input type="tel" name="phone" id="phone" value={form.phone} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block font-medium mb-1" htmlFor="preferredCallTime">Preferred Call Time<span className="text-red-500">*</span></label>
        <input
          type="text"
          name="preferredCallTime"
          id="preferredCallTime"
          value={form.preferredCallTime}
          onChange={handleChange}
          required
          placeholder="e.g. Weekday afternoons, after 5pm, etc."
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block font-medium mb-1" htmlFor="callRequestReason">Reason for Call<span className="text-red-500">*</span></label>
        <textarea
          name="callRequestReason"
          id="callRequestReason"
          value={form.callRequestReason}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
          rows={3}
          placeholder="Tell us briefly how we can help."
        />
      </div>
      <div className="flex items-center">
        <input type="checkbox" name="termsAccepted" id="termsAccepted" checked={form.termsAccepted} onChange={handleChange} required className="mr-2" />
        <label htmlFor="termsAccepted" className="text-sm">I accept the <a href="/terms-of-service" className="text-primary underline">Terms and Conditions</a><span className="text-red-500">*</span></label>
      </div>
      <button type="submit" className="w-full bg-primary text-white font-semibold py-2 rounded" disabled={status.type === "loading"}>
        {status.type === "loading" ? "Submitting..." : "Request Callback"}
      </button>
      {status.type === "error" && <p className="text-red-600 text-sm mt-2">{status.message}</p>}
      {status.type === "success" && <p className="text-green-600 text-sm mt-2">{status.message}</p>}
    </form>
  );
}

export default function RequestCallPage() {
  const searchParams = useSearchParams();
  const intent = (searchParams?.get("intent") || "").toLowerCase();

  const intentBanner =
    intent === "reschedule"
      ? {
          title: "Need to reschedule?",
          description: "Share your preferred new window and we’ll confirm availability within 1 hour (7 AM – 9 PM).",
        }
      : intent === "cancel"
        ? {
            title: "Need to cancel?",
            description: "Let us know the details and we’ll process your cancellation promptly.",
          }
        : null;

  return (
    <div className="py-12 md:py-16 lg:py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <PhoneCall className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Request a Callback
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Want to discuss your notary needs directly with our team? Fill out the form below, and we'll call you back as soon as possible during business hours.
          </p>
          {intentBanner && (
            <div className="mx-auto mt-4 max-w-2xl rounded-lg border border-sky-200 bg-sky-50 px-5 py-4 text-left text-sky-900">
              <div className="flex items-start gap-3">
                <TriangleAlert className="mt-0.5 h-5 w-5 text-sky-600" />
                <div>
                  <h2 className="text-base font-semibold text-sky-800">{intentBanner.title}</h2>
                  <p className="mt-1 text-sm text-sky-700">{intentBanner.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 shadow-xl rounded-lg">
  <CallRequestForm />
</div>


        <div className="text-center mt-8">
          <p className="text-gray-600">
            For general inquiries, you can also visit our <a href="/contact" className="text-primary hover:underline">Contact Page</a>.
          </p>
        </div>

      </div>
    </div>
  );
}
