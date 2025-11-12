# HMNP Bundle Cut List

This checklist tracks bundle-size optimizations and follow-on work discovered while profiling the Next.js build.

## Shipped in this iteration

- 🚀 Lazy-load `EstimatorStrip` on paid landing pages to defer calculator logic and localStorage hydration.
- 🚀 Lazy-load `MicroTestimonials` and availability counters so hero sections render with reduced JS.
- ✅ Ensure RUM thresholds (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1) are logged in the weekly owner report and surfaced on the admin analytics dashboard.

## Next candidates

- Defer AI chat widget (`components/ai/AIChatWidget`) until user interacts with assistant CTA.
- Split vendor charts/libs for admin analytics once real data replaces mock payloads.
- Replace lucide icon bundle on admin analytics with inline icon subset or sprite sheet if bundle analysis still highlights it.

Keep this list updated whenever large dependencies are introduced or removed so the team can track tangible bundle-size wins.

