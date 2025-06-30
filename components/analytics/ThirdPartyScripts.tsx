'use client'

import Script from 'next/script'

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

            // Override fetch to add protection
            const originalFetch = window.fetch;
            window.fetch = function(url, options = {}) {
              const key = options.method || 'GET' + ':' + url;
              const now = Date.now();
              
              // Rate limiting
              const minute = Math.floor(now / WINDOW);
              const countKey = minute + ':' + new URL(url).pathname;
              const count = requestCounts.get(countKey) || 0;
              
              if (count > RATE_LIMIT) {
                console.warn('🚨 Rate limit exceeded for:', url);
                return Promise.reject(new Error('Rate limit exceeded'));
              }
              requestCounts.set(countKey, count + 1);
              
              // Deduplication
              if (pendingRequests.has(key)) {
                console.log('♻️ Deduplicating request:', url);
                return pendingRequests.get(key).then(r => r.clone());
              }
              
              // Concurrent limit
              const concurrent = Array.from(pendingRequests.keys())
                .filter(k => k.includes(new URL(url).pathname)).length;
              if (concurrent >= MAX_CONCURRENT) {
                console.warn('🚨 Too many concurrent requests to:', url);
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
            
            console.log('✅ Request storm protection enabled');
          })();
        `}
      </Script>

      {/* Service Worker Registration - TEMPORARILY DISABLED */}
      <Script id="service-worker" strategy="afterInteractive">
        {`
          // Service Worker temporarily disabled to fix offline redirect loop
          console.log('ℹ️ Service Worker disabled - investigating offline redirect issue');
          
          // Unregister existing service worker if present
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
              for(let registration of registrations) {
                registration.unregister().then(function(boolean) {
                  console.log('🗑️ Service Worker unregistered:', boolean);
                });
              }
            });
          }
        `}
      </Script>
      
      {/* Meta Pixel Code */}
      <Script 
        id="meta-pixel" 
        strategy="afterInteractive"
        onError={() => console.warn('⚠️ Meta Pixel failed to load')}
        onLoad={() => console.log('✅ Meta Pixel loaded')}
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
            console.log('✅ Meta Pixel initialized');
          } catch (error) {
            console.warn('⚠️ Meta Pixel initialization failed:', error);
          }
        `}
      </Script>

      {/* Google Tag Manager */}
      <Script 
        id="gtm" 
        strategy="afterInteractive"
        onError={() => console.warn('⚠️ Google Tag Manager failed to load')}
        onLoad={() => console.log('✅ Google Tag Manager loaded')}
      >
        {`
          try {
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PMHB36X5');
            console.log('✅ Google Tag Manager initialized');
          } catch (error) {
            console.warn('⚠️ Google Tag Manager initialization failed:', error);
          }
        `}
      </Script>

      {/* LinkedIn Insight Tag */}
      <Script 
        id="linkedin-insight-tag" 
        strategy="afterInteractive"
        onError={() => console.warn('⚠️ LinkedIn Insight Tag failed to load')}
        onLoad={() => console.log('✅ LinkedIn Insight Tag loaded')}
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
            console.log('✅ LinkedIn Insight Tag initialized');
          } catch (error) {
            console.warn('⚠️ LinkedIn Insight Tag initialization failed:', error);
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

      {/* Noscript fallbacks */}
      <noscript>
        <img height="1" width="1" style={{display: 'none'}} 
             src="https://www.facebook.com/tr?id=1459938351663284&ev=PageView&noscript=1" />
      </noscript>

      <noscript>
        <img height="1" width="1" style={{display: 'none'}} 
             src="https://px.ads.linkedin.com/collect/?pid=514942430&fmt=gif" />
      </noscript>

      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PMHB36X5"
                height="0" width="0" style={{display: 'none', visibility: 'hidden'}}></iframe>
      </noscript>
    </>
  )
}