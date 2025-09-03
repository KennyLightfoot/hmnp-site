"use client";

import Link from "next/link";
import Image from "next/image";
import { dl } from "@/lib/datalayer";

const nav = [
	{ href: "/", label: "Home" },
	{
		label: "Services",
		children: [
			{ href: "/services/online-notarization", label: "Online Notarization" },
			{ href: "/services/mobile-notary", label: "Mobile Notary" },
			{ href: "/services/loan-signing", label: "Loan Signing" },
		],
	},
	{ href: "/pricing", label: "Pricing" },
	{ href: "/faq", label: "FAQ" },
	{ href: "/blog", label: "Blog" },
	{ href: "/testimonials", label: "Testimonials" },
	{ href: "/contact", label: "Contact/Booking" },
];

export default function SiteHeader() {
	return (
		<header className="sticky top-0 z-50 bg-[var(--ink)]/70 backdrop-blur border-b border-white/10">
			<div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
				<Link href="/" className="flex items-center gap-2" onClick={() => dl("nav_click", { to: "/" })}>
					<Image src="/assets/logo.svg" alt="Houston Mobile Notary Pros" width={36} height={36} />
					<span className="text-white font-medium">HMNP</span>
				</Link>
				<nav className="ml-auto hidden md:flex items-center gap-5">
					{nav.map((item: any) =>
						"children" in item ? (
							<div key={item.label} className="relative group">
								<button className="text-white/85 hover:text-white">{item.label}</button>
								<div className="absolute hidden group-hover:block bg-[var(--ink)] border border-white/10 rounded-xl mt-2 p-2">
									{item.children!.map((c: any) => (
										<Link key={c.href} href={c.href} className="block px-3 py-2 text-white/85 hover:text-white" onClick={() => dl("nav_click", { to: c.href })}>
											{c.label}
										</Link>
									))}
								</div>
							</div>
						) : (
							<Link key={item.href} href={item.href} className="text-white/85 hover:text-white" onClick={() => dl("nav_click", { to: item.href })}>
								{item.label}
							</Link>
						)
					)}
				</nav>
			</div>
		</header>
	);
}


