"use client"

import type { Metadata } from "next"
import { PhoneCall } from "lucide-react"
import React, { useState } from "react"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

function CallRequestForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferredCallTime: "",
    callRequestReason: "",
    termsAccepted: false,
  });
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message?: string }>({ type: "idle" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type, checked } = e.target;
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
        <input type="text" name="preferredCallTime" id="preferredCallTime" value={form.preferredCallTime} onChange={handleChange} required placeholder="e.g. Weekday afternoons, after 5pm, etc." className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block font-medium mb-1" htmlFor="callRequestReason">Reason for Call<span className="text-red-500">*</span></label>
        <textarea name="callRequestReason" id="callRequestReason" value={form.callRequestReason} onChange={handleChange} required className="w-full border rounded px-3 py-2" rows={3} />
      </div>
      <div className="flex items-center">
        <input type="checkbox" name="termsAccepted" id="termsAccepted" checked={form.termsAccepted} onChange={handleChange} required className="mr-2" />
        <label htmlFor="termsAccepted" className="text-sm">I accept the <a href="/terms" className="text-primary underline">Terms and Conditions</a><span className="text-red-500">*</span></label>
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
  return (
    <div className="py-12 md:py-16 lg:py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <PhoneCall className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Request a Callback
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Want to discuss your notary needs directly with our team? Fill out the form below, and we'll call you back as soon as possible during business hours.
          </p>
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
