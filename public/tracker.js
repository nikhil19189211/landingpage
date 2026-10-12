/**
 * Her First Income - Dual Client/Server Meta Tracking System
 * Deduplicates Meta Pixel and Conversions API (CAPI) events using a shared event_id.
 * Respects international privacy consent (UK, EU, CA, AU).
 */

(function () {
  // Capture UTMs & Ad IDs into sessionStorage
  function captureUrlParameters() {
    try {
      const params = new URLSearchParams(window.location.search);
      const trackingKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'v'];
      const captured = {};
      
      trackingKeys.forEach(key => {
        const val = params.get(key);
        if (val) {
          captured[key] = val;
          sessionStorage.setItem('hfi_' + key, val);
        }
      });

      // Also persist headline variant
      const variant = params.get('v') || sessionStorage.getItem('hfi_v') || 'v1';
      sessionStorage.setItem('hfi_headline_variant', variant.startsWith('v') ? variant : 'v' + variant);
    } catch (e) {
      console.warn('Parameter capture error', e);
    }
  }

  // Generate unique event ID for deduplication
  function generateEventId() {
    return 'hfi_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  // Get active headline variant
  function getHeadlineVariant() {
    return sessionStorage.getItem('hfi_headline_variant') || 'v1';
  }

  // Check consent state
  function hasTrackingConsent() {
    try {
      return localStorage.getItem('hfi_cookie_consent') === 'accepted';
    } catch (e) {
      return false;
    }
  }

  // Track event with both Meta Pixel (client) and CAPI (server)
  window.trackFunnelEvent = function (eventName, customData = {}, isCustom = false) {
    if (!hasTrackingConsent()) {
      // Consent not yet granted, ignore or wait
      return;
    }

    const eventId = generateEventId();
    const variant = getHeadlineVariant();
    
    // Inject headlineVariant and UTMs into customData
    const payloadData = {
      ...customData,
      headline_variant: variant,
      utm_content: sessionStorage.getItem('hfi_utm_content') || undefined,
      utm_source: sessionStorage.getItem('hfi_utm_source') || undefined,
      utm_campaign: sessionStorage.getItem('hfi_utm_campaign') || undefined
    };

    // 1. Meta Pixel client-side dispatch
    if (typeof window.fbq === 'function') {
      try {
        if (isCustom) {
          window.fbq('trackCustom', eventName, payloadData, { eventID: eventId });
        } else {
          window.fbq('track', eventName, payloadData, { eventID: eventId });
        }
      } catch (err) {
        console.warn('Meta Pixel dispatch error:', err);
      }
    }

    // 2. Cloudflare Pages Function CAPI server-side dispatch
    try {
      fetch('/api/capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: eventName,
          event_id: eventId,
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: window.location.href,
          custom_data: payloadData,
          is_custom: isCustom
        }),
        keepalive: true
      }).catch(function (err) {
        // Non-blocking catch for offline/dev environments
      });
    } catch (e) {
      // Non-blocking
    }
  };

  // Append UTM query params to outgoing checkout links
  function enrichCheckoutLinks() {
    try {
      const links = document.querySelectorAll('a[data-checkout-tier]');
      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
      
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) return;

        try {
          const url = new URL(href, window.location.origin);
          utmKeys.forEach(k => {
            const val = sessionStorage.getItem('hfi_' + k);
            if (val && !url.searchParams.has(k)) {
              url.searchParams.set(k, val);
            }
          });
          link.setAttribute('href', url.toString());
        } catch (e) {
          // If relative or invalid URL format, ignore
        }
      });
    } catch (e) {
      console.warn('Link enrichment error', e);
    }
  }

  // Initialize tracking on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    captureUrlParameters();
    enrichCheckoutLinks();

    // Attach click listeners to checkout buttons
    document.querySelectorAll('a[data-checkout-tier]').forEach(btn => {
      btn.addEventListener('click', function () {
        const tier = this.getAttribute('data-checkout-tier') || 'unknown';
        const price = parseFloat(this.getAttribute('data-checkout-price') || '0');
        
        window.trackFunnelEvent('InitiateCheckout', {
          content_name: tier,
          content_category: 'Digital Product',
          value: price,
          currency: 'USD'
        });
      });
    });
  });
})();
