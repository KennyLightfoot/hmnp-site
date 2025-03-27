import { PageHeader } from "@/components/page-header"

export default function AccessibilityPage() {
  return (
    <div className="container py-10">
      <PageHeader
        title="Accessibility Statement"
        description="Our commitment to making our services accessible to all users"
      />

      <div className="prose prose-lg max-w-none mt-8">
        <h2>Our Commitment</h2>
        <p>
          Houston Mobile Notary Pros is committed to ensuring digital accessibility for people with disabilities. We are
          continually improving the user experience for everyone, and applying the relevant accessibility standards.
        </p>

        <h2>Conformance Status</h2>
        <p>
          The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve
          accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and
          Level AAA. Our website is partially conformant with WCAG 2.1 level AA. Partially conformant means that some
          parts of the content do not fully conform to the accessibility standard.
        </p>

        <h2>Feedback</h2>
        <p>
          We welcome your feedback on the accessibility of our website. Please let us know if you encounter
          accessibility barriers:
        </p>
        <ul>
          <li>Phone: (281) 779-8847</li>
          <li>E-mail: info@houstonmobilenotarypros.com</li>
          <li>Postal address: Houston, TX</li>
        </ul>

        <h2>Compatibility with Browsers and Assistive Technology</h2>
        <p>Our website is designed to be compatible with the following assistive technologies:</p>
        <ul>
          <li>Screen readers including JAWS, NVDA, VoiceOver, and TalkBack</li>
          <li>Screen magnification software</li>
          <li>Speech recognition software</li>
          <li>Keyboard-only navigation</li>
        </ul>

        <h2>Technical Specifications</h2>
        <p>
          Accessibility of our website relies on the following technologies to work with the particular combination of
          web browser and any assistive technologies or plugins installed on your computer:
        </p>
        <ul>
          <li>HTML</li>
          <li>CSS</li>
          <li>JavaScript</li>
        </ul>
        <p>These technologies are relied upon for conformance with the accessibility standards used.</p>

        <h2>Assessment Approach</h2>
        <p>Houston Mobile Notary Pros assessed the accessibility of our website by the following approaches:</p>
        <ul>
          <li>Self-evaluation</li>
          <li>External evaluation</li>
        </ul>
      </div>
    </div>
  )
}

