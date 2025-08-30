import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { TrustSignals } from "@/components/trust-signals"
import { BookingGuide } from "@/components/booking-guide"
import { TestimonialsSection } from "@/components/testimonials-section"
import { SocialProofNotifications } from "@/components/social-proof-notifications"
import { GoogleReviewsWidget } from "@/components/google-reviews-widget"
import { Footer } from "@/components/footer"
import { StickyCTA } from "@/components/mobile/sticky-cta"
import { ExitIntentPopup } from "@/components/conversion/exit-intent-popup"
import { LiveChatWidget } from "@/components/conversion/live-chat-widget"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <TrustSignals />
        <BookingGuide />
        <TestimonialsSection />
        <GoogleReviewsWidget />
      </main>
      <Footer />
      <SocialProofNotifications />
      <StickyCTA />
      <ExitIntentPopup />
      <LiveChatWidget />
    </div>
  )
}
