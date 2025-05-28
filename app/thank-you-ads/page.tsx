"use client";

import Head from 'next/head';

export default function ThankYouAdsPage() {
  return (
    <>
      <Head>
        <title>Thank You! | Houston Mobile Notary Pros</title>
        {/* TODO: Add Facebook Pixel - Lead Event */}
        {/* 
          <script>
            fbq('track', 'Lead');
          </script>
        */}

        {/* TODO: Add Google Ads Conversion Tracking */}
        {/* 
          Example Google Ads Lead Conversion Snippet (replace with your actual GTAG_ID and AW_CONVERSION_ID)
          <script async src="https://www.googletagmanager.com/gtag/js?id=GTAG_ID"></script>
          <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GTAG_ID');
            gtag('event', 'conversion', {'send_to': 'AW_CONVERSION_ID/YOUR_CONVERSION_LABEL'});
          </script>
        */}

        {/* TODO: Add LinkedIn Insight Tag & Conversion Tracking */}
        {/* 
          Ensure LinkedIn Insight Tag is installed (usually in <head> of all pages or via GTM)
          Then, fire a conversion event:
          <script type="text/javascript">
            _linkedin_partner_id = "YOUR_LINKEDIN_PARTNER_ID";
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
          </script>
          <script type="text/javascript">
            (function(l) {
            if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])}; window.lintrk.q=[]}
            var s = document.getElementsByTagName("script")[0];
            var b = document.createElement("script");
            b.type = "text/javascript";b.async = true;
            b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
            s.parentNode.insertBefore(b, s);})(window.lintrk);
          </script>
          <noscript>
            <img height="1" width="1" style={{display:"none"}} alt="" src="https://px.ads.linkedin.com/collect/?pid=YOUR_LINKEDIN_PARTNER_ID&conversionId=YOUR_CONVERSION_ID&fmt=gif" />
          </noscript>
          
          Then, track the specific conversion (e.g., on button click or page load of thank you):
          <script>
            lintrk('track', { conversion_id: YOUR_CONVERSION_ID });
          </script>
        */}
      </Head>
      <div className="container mx-auto px-4 py-12 text-center">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-green-600">Thank You!</h1>
          <p className="text-2xl text-gray-700 mt-4">
            Your information has been submitted successfully.
          </p>
        </header>

        <section className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
          <p className="text-lg text-gray-600 mb-6">
            We appreciate you reaching out to Houston Mobile Notary Pros. A member of our team will be in contact with you shortly to discuss your notary needs.
          </p>
          <p className="text-lg text-gray-600">
            If you have any urgent questions, please don't hesitate to call us at <a href="tel:+17135828601" className="text-blue-600 hover:underline">(713) 582-8601</a>.
          </p>
        </section>

        <section className="mt-12">
          <a 
            href="/"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Back to Homepage
          </a>
        </section>
      </div>
    </>
  );
} 