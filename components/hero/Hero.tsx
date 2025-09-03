"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { dl } from "@/lib/datalayer";

export default function Hero() {
	const [src, setSrc] = useState("/images/hero/houston-downtown.jpg");

	return (
		<section className="relative isolate">
			<div className="relative h-[50svh] md:h-[62svh] lg:h-[72svh]">
				<Image
					src={src}
					alt="Downtown Houston skyline at dusk"
					fill
					priority
					sizes="100vw"
					onError={() => setSrc("/professional-notary-with-documents-and-seal-in-mod.jpg")}
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/35 to-black/20" />
				<div className="absolute inset-0 flex items-end md:items-center">
					<div className="mx-auto w-full max-w-6xl px-6 py-10 md:py-14">
						<h1 className="text-white text-3xl md:text-5xl font-semibold leading-tight">
							Houston Mobile Notary Pros
						</h1>
						<p className="mt-3 text-white/90 md:text-lg max-w-2xl">
							Fast, compliant online notarization and mobile signings—built for Texas.
						</p>
						<div className="mt-6 flex flex-wrap gap-3">
							<Link
								href="/booking"
								onClick={() => dl("cta_click_book_now")}
								className="rounded-2xl px-5 py-3 bg-[var(--accent)] text-white font-medium hover:opacity-90 focus:outline-none focus-visible:ring"
							>
								Book Now
							</Link>
							<Link
								href="/contact"
								onClick={() => dl("cta_click_contact")}
								className="rounded-2xl px-5 py-3 bg-white/10 text-white backdrop-blur hover:bg-white/15 focus:outline-none focus-visible:ring"
							>
								Contact Us
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}


