"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { dl } from "@/lib/datalayer";

export default function BookingCompleteBeacon(props: { bookingId?: string; valueUsd?: number; items?: any[] }) {
	const sp = useSearchParams();
	const booking_id = props.bookingId || (sp.get("booking_id") as string | null) || undefined;
	const value = props.valueUsd ?? undefined;

	useEffect(() => {
		const key = booking_id ? `hmnp_booking_complete_${booking_id}` : "hmnp_booking_complete_once";
		if (sessionStorage.getItem(key) === "1") return;
		sessionStorage.setItem(key, "1");

		dl("booking_complete", {
			booking_id,
			value,
			currency: value ? "USD" : undefined,
			items: props.items,
		});
	}, [booking_id, value, props.items]);

	return null;
}


