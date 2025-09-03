"use client";
import { useEffect, useRef } from "react";
import { dl } from "@/lib/datalayer";

export default function HeroViewBeacon() {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const obs = new IntersectionObserver(
			(entries) => {
				const e = entries[0];
				if (e.isIntersecting && e.intersectionRatio >= 0.5) {
					dl("hero_view", { section: "home_hero" });
					obs.disconnect();
				}
			},
			{ threshold: [0.5] }
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, []);
	return <div ref={ref} aria-hidden />;
}


