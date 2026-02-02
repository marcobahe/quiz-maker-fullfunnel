/**
 * Tracking & Pixel helper for Quiz Player
 *
 * Handles Facebook Pixel, Google Tag Manager, Google Analytics 4,
 * and custom head scripts. Works in both direct (/q/slug) and
 * embedded (iframe) contexts.
 */

// ── Script injection helpers ─────────────────────────────────

/**
 * Injects the Facebook Pixel base code into <head>.
 * @param {string} pixelId – e.g. "123456789012345"
 */
export function injectFacebookPixel(pixelId) {
  if (!pixelId || typeof window === 'undefined') return;
  if (window.__fb_pixel_injected) return;
  window.__fb_pixel_injected = true;

  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
  (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
}

/**
 * Injects the Google Tag Manager snippet.
 * @param {string} gtmId – e.g. "GTM-XXXXXX"
 */
export function injectGTM(gtmId) {
  if (!gtmId || typeof window === 'undefined') return;
  if (window.__gtm_injected) return;
  window.__gtm_injected = true;

  window.dataLayer = window.dataLayer || [];

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  document.head.appendChild(script);

  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });
}

/**
 * Injects Google Analytics 4 (gtag.js).
 * @param {string} gaId – e.g. "G-XXXXXXXXXX"
 */
export function injectGA4(gaId) {
  if (!gaId || typeof window === 'undefined') return;
  if (window.__ga4_injected) return;
  window.__ga4_injected = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', gaId);
}

/**
 * Injects arbitrary custom code into <head>.
 * ⚠️  Only call with trusted input – the public API strips this field.
 * @param {string} code – raw HTML/script string
 */
export function injectCustomHeadCode(code) {
  if (!code || typeof window === 'undefined') return;
  if (window.__custom_head_injected) return;
  window.__custom_head_injected = true;

  const container = document.createElement('div');
  container.innerHTML = code;

  // Move all child nodes into <head>
  while (container.firstChild) {
    const node = container.firstChild;
    // Re-create <script> tags so the browser executes them
    if (node.tagName === 'SCRIPT') {
      const s = document.createElement('script');
      if (node.src) {
        s.src = node.src;
        s.async = true;
      } else {
        s.textContent = node.textContent;
      }
      // Copy attributes
      for (const attr of node.attributes) {
        if (attr.name !== 'src') s.setAttribute(attr.name, attr.value);
      }
      document.head.appendChild(s);
      container.removeChild(node);
    } else {
      document.head.appendChild(node);
    }
  }
}

// ── Initialization ───────────────────────────────────────────

/**
 * Initialize all tracking scripts based on config.
 * Call once when the quiz loads.
 *
 * @param {Object} config – tracking configuration
 * @param {string} config.facebookPixelId
 * @param {string} config.googleTagManagerId
 * @param {string} config.googleAnalyticsId
 * @param {string} config.customHeadCode
 */
export function initTracking(config) {
  if (!config || typeof window === 'undefined') return;

  if (config.facebookPixelId) injectFacebookPixel(config.facebookPixelId);
  if (config.googleTagManagerId) injectGTM(config.googleTagManagerId);
  if (config.googleAnalyticsId) injectGA4(config.googleAnalyticsId);
  if (config.customHeadCode) injectCustomHeadCode(config.customHeadCode);
}

// ── Event dispatching ────────────────────────────────────────

/**
 * Fire a tracking event across all configured pixels/services.
 *
 * @param {Object}  config    – same tracking config object
 * @param {string}  eventName – one of: 'quizStart', 'questionAnswered', 'leadCaptured', 'quizCompleted'
 * @param {Object}  data      – event-specific payload
 * @param {string}  data.quizTitle
 * @param {number}  [data.questionNumber]
 * @param {number}  [data.questionTotal]
 * @param {number}  [data.score]
 */
export function trackEvent(config, eventName, data = {}) {
  if (!config || typeof window === 'undefined') return;

  // Check if this event type is enabled
  const events = config.events || {};
  if (events[eventName] === false) return;

  // ── Facebook Pixel ──────────────────────────────────────────
  if (config.facebookPixelId && typeof window.fbq === 'function') {
    switch (eventName) {
      case 'quizStart':
        window.fbq('track', 'ViewContent', {
          content_name: data.quizTitle || '',
        });
        break;
      case 'questionAnswered':
        window.fbq('trackCustom', 'QuestionAnswered', {
          question_number: data.questionNumber || 0,
          question_total: data.questionTotal || 0,
        });
        break;
      case 'leadCaptured':
        window.fbq('track', 'Lead', {
          content_name: data.quizTitle || '',
        });
        break;
      case 'quizCompleted':
        window.fbq('track', 'CompleteRegistration', {
          content_name: data.quizTitle || '',
          value: data.score || 0,
          currency: 'BRL',
        });
        break;
    }
  }

  // ── Google Analytics 4 (gtag) ───────────────────────────────
  if (config.googleAnalyticsId && typeof window.gtag === 'function') {
    switch (eventName) {
      case 'quizStart':
        window.gtag('event', 'quiz_start', {
          quiz_name: data.quizTitle || '',
        });
        break;
      case 'questionAnswered':
        window.gtag('event', 'question_answered', {
          question_number: data.questionNumber || 0,
        });
        break;
      case 'leadCaptured':
        window.gtag('event', 'generate_lead', {
          quiz_name: data.quizTitle || '',
        });
        break;
      case 'quizCompleted':
        window.gtag('event', 'quiz_complete', {
          quiz_name: data.quizTitle || '',
          score: data.score || 0,
        });
        break;
    }
  }

  // ── Google Tag Manager (dataLayer) ──────────────────────────
  if (config.googleTagManagerId) {
    window.dataLayer = window.dataLayer || [];
    switch (eventName) {
      case 'quizStart':
        window.dataLayer.push({
          event: 'quiz_start',
          quizTitle: data.quizTitle || '',
        });
        break;
      case 'questionAnswered':
        window.dataLayer.push({
          event: 'question_answered',
          questionNumber: data.questionNumber || 0,
          questionTotal: data.questionTotal || 0,
        });
        break;
      case 'leadCaptured':
        window.dataLayer.push({
          event: 'lead_captured',
          quizTitle: data.quizTitle || '',
        });
        break;
      case 'quizCompleted':
        window.dataLayer.push({
          event: 'quiz_complete',
          quizTitle: data.quizTitle || '',
          score: data.score || 0,
        });
        break;
    }
  }
}
