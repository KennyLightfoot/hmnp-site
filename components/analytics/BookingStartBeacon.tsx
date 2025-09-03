"use client";
import { useEffect } from "react";
import { dl } from "@/lib/datalayer";
import { usePathname } from "next/navigation";

/**
 * Fires booking_start once per session when user hits any /booking route.
 */
export default function BookingStartBeacon() {
	const pathname = usePathname();
	useEffect(() => {
		if (!pathname?.startsWith("/booking")) return;
		const key = "hmnp_booking_start_fired";
		if (sessionStorage.getItem(key) === "1") return;
		sessionStorage.setItem(key, "1");
		dl("booking_start", { path: pathname });
	}, [pathname]);
	return null;
}


