'use client'

import Script from 'next/script'

// Note: Using console methods instead of logger since this runs in browser context
const logInfo = (message: string) => {
  if (typeof window !== 'undefined') {
    console.log(`[ThirdPartyScripts] ${message}`)
  }
}

const logWarn = (message: string) => {
  if (typeof window !== 'undefined') {
    console.warn(`[ThirdPartyScripts] ${message} - This may be due to ad blockers or privacy tools and is expected behavior.`)
  }
}

export default function ThirdPartyScripts() {
  return (
    <>
      {/* EMERGENCY: Request Storm Protection */}
      <Script id="request-storm-protection" strategy="beforeInteractive">
        {`
          // Emergency request deduplication and storm protection
          (function() {
            const pendingRequests = new Map();
            const requestCounts = new Map();
            const MAX_CONCURRENT = 3;
            const RATE_LIMIT = 100; // per minute
            const WINDOW = 60000; // 1 minute

            // Helper function to get pathname from URL (handles relative and absolute URLs)
            function getUrlPath(url) {
              try {
                // If it's already a relative path starting with /, just return it
                if (typeof url === 'string' && url.startsWith('/')) {
                  return url.split('?')[0]; // Remove query params, keep path only
                }
                // If it's an absolute URL, parse it
                if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
                  return new URL(url).pathname;
                }
                // For any other case, try to create URL with current origin
                return new URL(url, window.location.origin).pathname;
              } catch (e) {
                // Fallback: if all else fails, just use the string as-is
                // Note: Using console.warn here instead of logger because this runs in browser context before logger is available
                return String(url);
              }
            }

            // Override fetch to add protection
            const originalFetch = window.fetch;
            window.fetch = function(url, options = {}) {
              const key = options.method || 'GET' + ':' + url;
              const now = Date.now();
              
              // Rate limiting
              const minute = Math.floor(now / WINDOW);
              const urlPath = getUrlPath(url);
              const countKey = minute + ':' + urlPath;
              const count = requestCounts.get(countKey) || 0;
              
              if (count > RATE_LIMIT) {
                // Note: Using console.warn here instead of logger because this runs in browser context
                return Promise.reject(new Error('Rate limit exceeded'));
              }
              requestCounts.set(countKey, count + 1);
              
              // Deduplication
              if (pendingRequests.has(key)) {
                // Note: Using console.log here instead of logger because this runs in browser context
                return pendingRequests.get(key).then(r => r.clone());
              }
              
              // Concurrent limit
              const concurrent = Array.from(pendingRequests.keys())
                .filter(k => k.includes(urlPath)).length;
              if (concurrent >= MAX_CONCURRENT) {
                // Note: Using console.warn here instead of logger because this runs in browser context
                return Promise.reject(new Error('Too many concurrent requests'));
              }
              
              const promise = originalFetch.call(this, url, options);
              pendingRequests.set(key, promise);
              
              promise.finally(() => {
                setTimeout(() => pendingRequests.delete(key), 100);
              });
              
              return promise;
            };
            
            // Clean up old rate limit entries
            setInterval(() => {
              const cutoff = Math.floor(Date.now() / WINDOW) - 2;
              for (const key of requestCounts.keys()) {
                if (parseInt(key.split(':')[0]) < cutoff) {
                  requestCounts.delete(key);
                }
              }
            }, WINDOW);
            
            // Note: Using console.log here instead of logger because this runs in browser context
          })();
        `}
      </Script>

      {/* Service Worker Registration - TEMPORARILY DISABLED */}
      <Script id="service-worker" strategy="afterInteractive">
        {`
          // Service Worker disabled to prevent 404 errors
          // Note: Using console.log here instead of logger because this runs in browser context
          console.log('Service worker functionality disabled');
        `}
      </Script>
      
      {/* Meta Pixel Code */}
      <Script 
        id="meta-pixel" 
        strategy="afterInteractive"
        onError={() => logWarn('Meta Pixel failed to load')}
        onLoad={() => logInfo('Meta Pixel loaded')}
      >
        {`
          try {
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1459938351663284');
            fbq('track', 'PageView');
            // Note: Using console.log here instead of logger because this runs in browser context
          } catch (error) {
            // Note: Using console.warn here instead of logger because this runs in browser context
          }
        `}
      </Script>

      {/* Google Tag Manager */}
      <Script 
        id="gtm" 
        strategy="afterInteractive"
        onError={() => logWarn('Google Tag Manager failed to load')}
        onLoad={() => logInfo('Google Tag Manager loaded')}
      >
        {`
          try {
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PMHB36X5');
            // Note: Using console.log here instead of logger because this runs in browser context
          } catch (error) {
            // Note: Using console.warn here instead of logger because this runs in browser context
          }
        `}
      </Script>

      {/* LinkedIn Insight Tag */}
      <Script 
        id="linkedin-insight-tag" 
        strategy="afterInteractive"
        onError={() => logWarn('LinkedIn Insight Tag failed to load')}
        onLoad={() => logInfo('LinkedIn Insight Tag loaded')}
      >
        {`
          try {
            _linkedin_partner_id = "514942430";
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
            (function(l) {
            if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])}; window.lintrk.q=[]}
            var s = document.getElementsByTagName("script")[0];
            var b = document.createElement("script");
            b.type = "text/javascript";b.async = true;
            b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
            s.parentNode.insertBefore(b, s);})(window.lintrk);
            // Note: Using console.log here instead of logger because this runs in browser context
          } catch (error) {
            // Note: Using console.warn here instead of logger because this runs in browser context
          }
        `}
      </Script>

      {/* Google Ads Conversion Tracking */}
      <Script id="google-ads" strategy="afterInteractive">
        {`
          // Google Ads Global Site Tag will be configured in GTM
          // Or add your Google Ads conversion ID here when available
          // Example: gtag('config', 'AW-CONVERSION_ID');
        `}
      </Script>

      {/* Yelp Conversion Tracking */}
      <Script id="yelp-tracking" strategy="afterInteractive">
        {`
          // Yelp tracking will be added when you provide the Yelp tracking ID
          // Contact Yelp Ads support for your specific tracking code
          // Example format: yelp_conversion_id = "YOUR_YELP_TRACKING_ID";
        `}
      </Script>

      {/* Noscript fallbacks - Removed to prevent SSR Html import conflicts 
          These will be added via GTM or other means when needed */}
    </>
  )
}