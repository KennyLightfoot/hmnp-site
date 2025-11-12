'use client';

import { useEffect } from 'react';

export default function ThankYouAdsClient() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead');
    }

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to:
          process.env.NEXT_PUBLIC_GOOGLE_ADS_SEND_TO ||
          process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID ||
          'AW-17079349538/CONVERSION_LABEL',
      });
    }
  }, []);

  return null;
}

