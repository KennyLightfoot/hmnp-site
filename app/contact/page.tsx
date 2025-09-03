import ContactForm from "@/components/contact/ContactForm";
import ContactFormBeacon from "@/components/analytics/ContactFormBeacon";

export default function ContactPage() {
	return (
		<div className="mx-auto max-w-6xl px-6 py-12 text-white">
			<h1 className="text-3xl md:text-4xl font-semibold">Contact Us</h1>
			<p className="mt-2 text-white/80">Tell us about your notarization needs and we’ll reply quickly.</p>
			<div className="mt-8">
				<ContactForm />
				<ContactFormBeacon />
			</div>
		</div>
	);
}


