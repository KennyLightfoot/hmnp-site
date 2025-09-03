"use client";
import { useState } from "react";

export default function ContactForm() {
	const [status, setStatus] = useState<"idle"|"pending"|"success"|"error">("idle");
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setStatus("pending"); setError(null);
		const fd = new FormData(e.currentTarget);
		const payload = {
			name: fd.get("name"),
			email: fd.get("email"),
			phone: fd.get("phone"),
			message: fd.get("message"),
		};

		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			setStatus("success");
			(e.currentTarget as HTMLFormElement).reset();
		} catch (err: any) {
			setStatus("error");
			setError(err?.message ?? "Failed to send");
		} finally {
			setStatus((s) => (s === "pending" ? "idle" : s));
		}
	}

	return (
		<form id="contact-form" onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-4">
			<div>
				<label className="block text-sm text-white/80">Name</label>
				<input name="name" required className="mt-1 w-full rounded-xl bg-white/10 text-white px-3 py-2 outline-none focus:ring" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm text-white/80">Email</label>
					<input type="email" name="email" required className="mt-1 w-full rounded-xl bg-white/10 text-white px-3 py-2 outline-none focus:ring" />
				</div>
				<div>
					<label className="block text-sm text-white/80">Phone</label>
					<input type="tel" name="phone" className="mt-1 w-full rounded-xl bg-white/10 text-white px-3 py-2 outline-none focus:ring" />
				</div>
			</div>
			<div>
				<label className="block text-sm text-white/80">Message</label>
				<textarea name="message" rows={5} className="mt-1 w-full rounded-xl bg-white/10 text-white px-3 py-2 outline-none focus:ring" />
			</div>
			<button className="rounded-2xl px-5 py-3 bg-[var(--accent)] text-white font-medium hover:opacity-90 disabled:opacity-50">
				Send message
			</button>
			{status === "success" && <p className="text-green-400">Thanks! We’ll be in touch shortly.</p>}
			{status === "error" && <p className="text-red-400">Something went wrong. {error}</p>}
		</form>
	);
}


