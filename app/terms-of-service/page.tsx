import { PageHeader } from "@/components/page-header"

export default function TermsOfServicePage() {
  return (
    <div className="container py-10">
      <PageHeader title="Terms of Service" description="The terms and conditions governing your use of our services" />

      <div className="prose prose-lg max-w-none mt-8">
        <p>
          <strong>Last Updated: March 1, 2023</strong>
        </p>

        <h2>Agreement to Terms</h2>
        <p>
          By accessing or using our services, you agree to be bound by these Terms of Service and all applicable laws
          and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our
          services.
        </p>

        <h2>Use License</h2>
        <p>
          Permission is granted to temporarily use our services for personal, non-commercial transitory viewing only.
          This is the grant of a license, not a transfer of title, and under this license you may not:
        </p>
        <ul>
          <li>Modify or copy the materials;</li>
          <li>
            Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);
          </li>
          <li>Attempt to decompile or reverse engineer any software contained in our services;</li>
          <li>Remove any copyright or other proprietary notations from the materials; or</li>
          <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
        </ul>
        <p>
          This license shall automatically terminate if you violate any of these restrictions and may be terminated by
          Houston Mobile Notary Pros at any time.
        </p>

        <h2>Disclaimer</h2>
        <p>
          The materials on our website are provided on an 'as is' basis. Houston Mobile Notary Pros makes no warranties,
          expressed or implied, and hereby disclaims and negates all other warranties including, without limitation,
          implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of
          intellectual property or other violation of rights.
        </p>
        <p>
          Further, Houston Mobile Notary Pros does not warrant or make any representations concerning the accuracy,
          likely results, or reliability of the use of the materials on its website or otherwise relating to such
          materials or on any sites linked to this site.
        </p>

        <h2>Limitations</h2>
        <p>
          In no event shall Houston Mobile Notary Pros or its suppliers be liable for any damages (including, without
          limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or
          inability to use our services, even if Houston Mobile Notary Pros or a Houston Mobile Notary Pros authorized
          representative has been notified orally or in writing of the possibility of such damage.
        </p>

        <h2>Accuracy of Materials</h2>
        <p>
          The materials appearing on our website could include technical, typographical, or photographic errors. Houston
          Mobile Notary Pros does not warrant that any of the materials on its website are accurate, complete or
          current. Houston Mobile Notary Pros may make changes to the materials contained on its website at any time
          without notice. However Houston Mobile Notary Pros does not make any commitment to update the materials.
        </p>

        <h2>Links</h2>
        <p>
          Houston Mobile Notary Pros has not reviewed all of the sites linked to its website and is not responsible for
          the contents of any such linked site. The inclusion of any link does not imply endorsement by Houston Mobile
          Notary Pros of the site. Use of any such linked website is at the user's own risk.
        </p>

        <h2>Modifications</h2>
        <p>
          Houston Mobile Notary Pros may revise these terms of service for its website at any time without notice. By
          using this website you are agreeing to be bound by the then current version of these terms of service.
        </p>

        <h2>Governing Law</h2>
        <p>
          These terms and conditions are governed by and construed in accordance with the laws of Texas and you
          irrevocably submit to the exclusive jurisdiction of the courts in that State.
        </p>

        <h2>Contact Information</h2>
        <p>If you have any questions about these Terms of Service, please contact us:</p>
        <p>
          Houston Mobile Notary Pros
          <br />
          Phone: (281) 779-8847
          <br />
          Email: info@houstonmobilenotarypros.com
        </p>
      </div>
    </div>
  )
}

