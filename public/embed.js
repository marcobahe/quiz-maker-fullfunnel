/**
 * QuizMeBaby - Embed Script
 * Lightweight vanilla JS for embedding quizzes as popups/modals.
 *
 * Usage:
 *   <script src="https://yourdomain.com/embed.js" data-quiz="your-slug"></script>
 *   <button onclick="QuizMaker.open('your-slug')">Fazer Quiz</button>
 */
(function () {
  'use strict';

  // Detect base URL from the script tag itself
  var scripts = document.getElementsByTagName('script');
  var currentScript = scripts[scripts.length - 1];
  var scriptSrc = currentScript.src || '';
  var baseUrl = scriptSrc.replace(/\/embed\.js(\?.*)?$/, '');

  // Parse configuration from data attributes
  var quizSlug = currentScript.getAttribute('data-quiz');
  var triggerType = currentScript.getAttribute('data-trigger') || 'immediate';
  var delay = parseInt(currentScript.getAttribute('data-delay')) || 5000;
  var scrollPercent = parseInt(currentScript.getAttribute('data-scroll')) || 50;
  var showOnce = currentScript.getAttribute('data-show-once') === 'true';
  var displayMode = currentScript.getAttribute('data-mode') || 'popup';

  // ── Styles (injected once) ──────────────────────────────────
  var STYLE_ID = 'quizmaker-embed-styles';
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      // Popup mode (default)
      '.qm-overlay {',
      '  position: fixed; top: 0; left: 0; width: 100%; height: 100%;',
      '  background: rgba(0,0,0,0.6); z-index: 999999;',
      '  display: flex; align-items: center; justify-content: center;',
      '  opacity: 0; transition: opacity 0.3s ease;',
      '  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);',
      '}',
      '.qm-overlay.qm-visible { opacity: 1; }',
      '.qm-modal {',
      '  position: relative; width: 94%; max-width: 640px;',
      '  height: 85vh; max-height: 800px;',
      '  background: #fff; border-radius: 16px;',
      '  overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.25);',
      '  transform: translateY(30px) scale(0.97);',
      '  transition: transform 0.3s ease;',
      '}',
      '.qm-overlay.qm-visible .qm-modal {',
      '  transform: translateY(0) scale(1);',
      '}',
      
      // Slide-right mode
      '.qm-overlay.qm-slide-right {',
      '  background: transparent; align-items: flex-start; justify-content: flex-end;',
      '  padding: 20px;',
      '}',
      '.qm-overlay.qm-slide-right .qm-modal {',
      '  width: 400px; max-width: 90vw; height: calc(100vh - 40px);',
      '  max-height: none; transform: translateX(100%);',
      '  border-radius: 12px 0 0 12px;',
      '}',
      '.qm-overlay.qm-slide-right.qm-visible .qm-modal {',
      '  transform: translateX(0);',
      '}',
      
      // Slide-bottom mode  
      '.qm-overlay.qm-slide-bottom {',
      '  background: transparent; align-items: flex-end; justify-content: center;',
      '  padding: 0;',
      '}',
      '.qm-overlay.qm-slide-bottom .qm-modal {',
      '  width: 100%; max-width: 640px; height: 70vh;',
      '  max-height: 600px; transform: translateY(100%);',
      '  border-radius: 16px 16px 0 0;',
      '  margin: 0 auto;',
      '}',
      '.qm-overlay.qm-slide-bottom.qm-visible .qm-modal {',
      '  transform: translateY(0);',
      '}',
      
      // Close button
      '.qm-close {',
      '  position: absolute; top: 12px; right: 12px; z-index: 10;',
      '  width: 36px; height: 36px; border-radius: 50%;',
      '  background: rgba(0,0,0,0.5); border: none; cursor: pointer;',
      '  display: flex; align-items: center; justify-content: center;',
      '  transition: background 0.2s;',
      '}',
      '.qm-close:hover { background: rgba(0,0,0,0.7); }',
      '.qm-close svg { width: 18px; height: 18px; color: #fff; }',
      
      // Iframe
      '.qm-iframe {',
      '  width: 100%; height: 100%; border: none;',
      '}',
      
      // Mobile responsive
      '@media (max-width: 640px) {',
      '  .qm-modal { width: 100%; height: 100%; max-height: 100%;',
      '    border-radius: 0; }',
      '  .qm-overlay.qm-slide-right .qm-modal,',
      '  .qm-overlay.qm-slide-bottom .qm-modal {',
      '    width: 100%; height: 100%; max-height: 100%;',
      '    border-radius: 0; transform: translateY(100%);',
      '  }',
      '  .qm-overlay.qm-slide-right.qm-visible .qm-modal,',
      '  .qm-overlay.qm-slide-bottom.qm-visible .qm-modal {',
      '    transform: translateY(0);',
      '  }',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  // ── Close SVG icon ──────────────────────────────────────────
  var CLOSE_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  // ── Core ────────────────────────────────────────────────────
  var overlay = null;

  function open(slug, options) {
    if (!slug) { console.error('QuizMaker: slug is required'); return; }
    options = options || {};

    injectStyles();

    // Create overlay
    overlay = document.createElement('div');
    overlay.className = 'qm-overlay';
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    // Create modal container
    var modal = document.createElement('div');
    modal.className = 'qm-modal';

    // Close button
    var closeBtn = document.createElement('button');
    closeBtn.className = 'qm-close';
    closeBtn.innerHTML = CLOSE_SVG;
    closeBtn.setAttribute('aria-label', 'Fechar');
    closeBtn.addEventListener('click', close);

    // Iframe
    var iframe = document.createElement('iframe');
    iframe.className = 'qm-iframe';
    iframe.src = baseUrl + '/q/' + encodeURIComponent(slug) + '?embed=true';
    iframe.setAttribute('allow', 'autoplay; fullscreen');
    iframe.setAttribute('loading', 'lazy');

    modal.appendChild(closeBtn);
    modal.appendChild(iframe);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Trigger transition
    requestAnimationFrame(function () {
      overlay.classList.add('qm-visible');
    });

    // ESC key to close
    document.addEventListener('keydown', onEsc);
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('qm-visible');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onEsc);
    setTimeout(function () {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      overlay = null;
    }, 300);
  }

  function onEsc(e) {
    if (e.key === 'Escape') close();
  }

  // ── PostMessage listener (auto-resize & quiz completion) ───
  window.addEventListener('message', function (e) {
    if (!e.data || typeof e.data !== 'object') return;

    if (e.data.type === 'quizmaker:resize' && overlay) {
      var modal = overlay.querySelector('.qm-modal');
      if (modal && e.data.height) {
        var h = Math.min(e.data.height + 20, window.innerHeight * 0.92);
        modal.style.height = h + 'px';
      }
    }

    if (e.data.type === 'quizmaker:complete') {
      // Dispatch custom event for the host page
      var evt = new CustomEvent('quizmaker:complete', {
        detail: {
          slug: e.data.slug,
          score: e.data.score,
          category: e.data.category,
        },
      });
      window.dispatchEvent(evt);
    }
  });

  // ── Auto-init from data-quiz attribute ─────────────────────
  var autoSlug = currentScript.getAttribute('data-quiz');
  // (auto-open only if data-auto-open="true" is set)
  if (autoSlug && currentScript.getAttribute('data-auto-open') === 'true') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { open(autoSlug); });
    } else {
      open(autoSlug);
    }
  }

  // ── Public API ─────────────────────────────────────────────
  window.QuizMeBaby = {
    open: open,
    close: close,
  };
  // Backward compatibility
  window.QuizMaker = window.QuizMeBaby;
})();
