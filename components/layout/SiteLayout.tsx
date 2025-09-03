import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-svh bg-[var(--ink)] text-[var(--text)]">
			<a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>
			<SiteHeader />
			<main id="main">{children}</main>
			<SiteFooter />
		</div>
	);
}


