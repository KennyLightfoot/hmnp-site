"use client";
import { useEffect } from "react";
import { dl } from "@/lib/datalayer";

/** Listens for submit on #contact-form and pushes form_submit_contact (no PII) */
export default function ContactFormBeacon({ selector = "#contact-form" }: { selector?: string }) {
	useEffect(() => {
		if (typeof document === "undefined") return;
		const form = document.querySelector<HTMLFormElement>(selector);
		if (!form) return;

		const handler = () => {
			dl("form_submit_contact", { source: "contact_page" });
		};

		form.addEventListener("submit", handler);
		return () => form.removeEventListener("submit", handler);
	}, [selector]);

	return null;
}


