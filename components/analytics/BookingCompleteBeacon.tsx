"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { dl } from "@/lib/datalayer";

/**
 * Fires booking_complete when success page mounts.
 * Reads booking_id from props or ?booking_id=… if present.
 */
export default function BookingCompleteBeacon(props: { bookingId?: string }) {
	const sp = useSearchParams();
	const bookingId = props.bookingId || (sp.get("booking_id") as string | null) || undefined;

	useEffect(() => {
		dl("booking_complete", { booking_id: bookingId });
	}, [bookingId]);

	return null;
}


