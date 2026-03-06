/* tag-colors.js
   Applies consistent per-label colors to category/tag pills sitewide.
*/
(function() {
  'use strict';

  function hash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function toneFromLabel(label) {
    var key = String(label || '').trim().toLowerCase();
    var hv = hash(key || 'default') % 360;
    return {
      bg: 'hsl(' + hv + ' 78% 94%)',
      border: 'hsl(' + hv + ' 48% 78%)',
      text: 'hsl(' + hv + ' 54% 28%)'
    };
  }

  function colorize(el) {
    var label = (el.getAttribute('data-color-key') || el.textContent || '').trim();
    if (!label) return;
    var t = toneFromLabel(label);
    el.style.background = t.bg;
    el.style.borderColor = t.border;
    el.style.color = t.text;
  }

  function run() {
    var selectors = [
      '.lcat',
      '.guide-tag',
      '.card-tag',
      '.parts-tag',
      '.featured-biz-tag',
      '.biz-type',
      '.featured-biz-type',
      '.post-type'
    ];

    document.querySelectorAll(selectors.join(',')).forEach(colorize);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
