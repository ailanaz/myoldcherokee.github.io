/* ratings.js — anonymous 1-5 star ratings via Supabase
   OldXJS.com — static GitHub Pages
   ─────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var SUPABASE_URL  = 'https://yrwegatjriewuhjyyokm.supabase.co';
  var SUPABASE_KEY  = 'sb_publishable_JuN6TdSeWDJX8DlgqzbHwA_ZHt5hOLS';
  var THROTTLE_MS   = 30 * 24 * 60 * 60 * 1000; // 30 days
  var LS_PREFIX     = 'moc_rated_';

  function isDirectoryPath(path) {
    return /(^|\/)directory(\.html)?\/?$/i.test(path || '');
  }

  /* ── localStorage throttle ───────────────────────────── */
  function hasRated(bid) {
    try {
      var ts = localStorage.getItem(LS_PREFIX + bid);
      return !!(ts && (Date.now() - Number(ts)) < THROTTLE_MS);
    } catch (e) { return false; }
  }

  function markRated(bid) {
    try { localStorage.setItem(LS_PREFIX + bid, String(Date.now())); } catch (e) {}
  }

  /* ── build the inner HTML for a .biz-rating-wrap ─────── */
  function ratingDisplayHtml(data) {
    var avg = 0.0;
    var count = 0;
    if (data && typeof data.avg_rating !== 'undefined' && data.avg_rating !== null) {
      avg = Number(data.avg_rating) || 0;
    }
    if (data && typeof data.rating_count !== 'undefined' && data.rating_count !== null) {
      count = Number(data.rating_count) || 0;
    }
    return '<span class="biz-rating-stars">\u2605 ' + avg.toFixed(1) + '</span>' +
      '\u00a0<span class="biz-rating-count">(' + count + ')</span>';
  }

  function buildInner(bid, data, allowRating) {
    /* display line (locked sitewide format) */
    var dispHtml = ratingDisplayHtml(data);

    /* action */
    var rowHtml = dispHtml;
    if (allowRating) {
      rowHtml = '<button class="btn btn-outline btn-sm rating-open-btn" data-bid="' + bid + '" aria-expanded="false">Rate</button>' +
        '\u00a0' + dispHtml;
    }

    /* star form (directory only) */
    var formHtml = !allowRating ? '' :
      '<div class="rating-form" aria-hidden="true">' +
        '<div class="star-picker" data-bid="' + bid + '" data-selected="0">' +
          [1, 2, 3, 4, 5].map(function (v) {
            return '<span class="sp-star" data-val="' + v + '" role="button" tabindex="0" aria-label="' + v + ' star">\u2605</span>';
          }).join('') +
        '</div>' +
        '<button class="btn btn-red btn-sm rating-submit-btn" data-bid="' + bid + '" disabled>Submit</button>' +
        '<span class="rating-confirm" style="display:none;">Thanks! \u2713</span>' +
      '</div>';

    return '<div class="biz-rating-row">' + rowHtml + '</div>' + formHtml;
  }

  /* ── inject wrap into a card ─────────────────────────── */
  function inject(card, bid, data) {
    var body = card.querySelector('.biz-body') ||
      card.querySelector('.featured-biz-body') ||
      card.querySelector('.state-feat-body');
    if (!body) return;
    if (body.querySelector('.biz-rating-wrap')) return; // already injected

    var actions = body.querySelector('.biz-actions') ||
      body.querySelector('.featured-biz-actions') ||
      body.querySelector('.state-feat-actions');
    var path = window.location.pathname || '';
    var isDirectoryPage = isDirectoryPath(path);
    var isStatePage = /(^|\/)state\//i.test(path);
    var allowRating = isDirectoryPage;

    var wrap = document.createElement('div');
    wrap.className = 'biz-rating-wrap';
    wrap.setAttribute('data-bid', bid);
    wrap.innerHTML = buildInner(bid, data, allowRating);
    if (actions && actions.classList && actions.classList.contains('biz-actions') && isDirectoryPage) {
      actions.classList.add('biz-actions--rate-left');
      actions.style.display = 'grid';
      actions.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
      actions.style.gap = '0.45rem';
      actions.style.alignItems = 'center';
      actions.style.flexWrap = 'unset';
      actions.insertBefore(wrap, actions.firstChild);
      Array.prototype.slice.call(actions.querySelectorAll('a.btn, button.btn, span.btn')).forEach(function(btn) {
        if (!btn.closest('.biz-rating-wrap')) btn.classList.add('biz-cta-btn');
      });
    } else if (actions && actions.classList && actions.classList.contains('state-feat-actions') && isStatePage) {
      actions.classList.add('state-feat-actions--rate-left');
      actions.insertBefore(wrap, actions.firstChild);
      Array.prototype.slice.call(actions.querySelectorAll('a.btn, button.btn, span.btn')).forEach(function(btn) {
        if (!btn.closest('.biz-rating-wrap')) btn.classList.add('biz-cta-btn');
      });
    } else if (actions) {
      body.insertBefore(wrap, actions);
    } else {
      body.appendChild(wrap);
    }
  }

  /* ── update display after a successful submit ─────────── */
  function refreshDisplay(bid, data) {
    var wraps = Array.prototype.slice.call(
      document.querySelectorAll('.biz-rating-wrap[data-bid="' + bid + '"]')
    );
    if (!wraps.length) return;
    var dispHtml = ratingDisplayHtml(data);
    var path = window.location.pathname || '';
    var isDirectoryPage = isDirectoryPath(path);
    wraps.forEach(function (wrap) {
      var row = wrap.querySelector('.biz-rating-row');
      if (!row) return;
      if (isDirectoryPage) {
        row.innerHTML = '<button class="btn btn-outline btn-sm rating-open-btn" data-bid="' + bid + '" aria-expanded="false">Rate</button>\u00a0' + dispHtml;
      } else {
        row.innerHTML = dispHtml;
      }
    });
  }

  /* ── delegated event listeners (wired once) ──────────── */
  function wireEvents(db) {

    document.addEventListener('click', function (e) {
      var t = e.target;

      /* open / close rating form */
      var openBtn = t.closest ? t.closest('.rating-open-btn') : null;
      if (openBtn) {
        var wrap = openBtn.closest('.biz-rating-wrap');
        var form = wrap && wrap.querySelector('.rating-form');
        if (!form) return;
        var isOpen = form.classList.contains('open');
        form.classList.toggle('open', !isOpen);
        form.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
        openBtn.textContent = isOpen ? 'Rate' : 'Cancel';
        openBtn.setAttribute('aria-expanded', String(!isOpen));
        return;
      }

      /* star selection */
      var star = t.closest ? t.closest('.sp-star') : null;
      if (star) {
        var picker = star.closest('.star-picker');
        var val    = parseInt(star.getAttribute('data-val'), 10);
        picker.setAttribute('data-selected', String(val));
        picker.querySelectorAll('.sp-star').forEach(function (s, i) {
          s.classList.toggle('sp-active', i < val);
          s.classList.remove('sp-hover');
        });
        var subBtn = picker.parentElement.querySelector('.rating-submit-btn');
        if (subBtn) subBtn.disabled = false;
        return;
      }

      /* submit */
      var subBtn = t.closest ? t.closest('.rating-submit-btn') : null;
      if (subBtn) {
        var bid    = subBtn.getAttribute('data-bid');
        var wrap   = subBtn.closest('.biz-rating-wrap');
        var form   = wrap && wrap.querySelector('.rating-form');
        var picker = form && form.querySelector('.star-picker');
        var sel    = picker ? parseInt(picker.getAttribute('data-selected'), 10) : 0;

        if (!sel || sel < 1 || sel > 5) return;
        if (hasRated(bid)) return;

        subBtn.disabled    = true;
        subBtn.textContent = 'Saving\u2026';

        db.from('business_ratings')
          .insert({ business_id: bid, rating: sel })
          .then(function (res) {
            if (res.error) {
              console.error('[ratings] insert error', res.error);
              subBtn.textContent = 'Error — retry';
              subBtn.disabled    = false;
              return;
            }
            markRated(bid);
            var confirm = form.querySelector('.rating-confirm');
            if (confirm) confirm.style.display = 'inline';
            subBtn.style.display = 'none';

            /* live-refresh the average */
            db.from('business_rating_summary')
              .select('business_id, avg_rating, rating_count')
              .eq('business_id', bid)
              .maybeSingle()
              .then(function (r) {
                if (r.data) refreshDisplay(bid, r.data);
              });
          });
      }
    });

    /* star hover highlights */
    document.addEventListener('mouseover', function (e) {
      var star = e.target.closest ? e.target.closest('.sp-star') : null;
      if (!star) return;
      var picker = star.closest('.star-picker');
      var val    = parseInt(star.getAttribute('data-val'), 10);
      picker.querySelectorAll('.sp-star').forEach(function (s, i) {
        s.classList.toggle('sp-hover', i < val);
      });
    });

    document.addEventListener('mouseout', function (e) {
      var star = e.target.closest ? e.target.closest('.sp-star') : null;
      if (!star) return;
      star.closest('.star-picker').querySelectorAll('.sp-star').forEach(function (s) {
        s.classList.remove('sp-hover');
      });
    });

    /* keyboard: Enter/Space on stars */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var star = e.target.closest ? e.target.closest('.sp-star') : null;
      if (star) { e.preventDefault(); star.click(); }
    });
  }

  /* ── init ─────────────────────────────────────────────── */
  function init() {
    if (!window.supabase || !window.supabase.createClient) {
      console.warn('[ratings] Supabase JS not loaded');
      return;
    }

    var db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    var summaryMap = {};
    var hydrateTimer = null;

    function getCards() {
      return Array.prototype.slice.call(
        document.querySelectorAll(
          '[data-business-id]:not(.featured-biz-card--inactive):not(.biz-card--inactive):not(.state-feat-card--inactive):not(.listing-card--inactive)'
        )
      );
    }

    function fetchSummaries(bids) {
      if (!bids.length) return Promise.resolve();
      return db.from('business_rating_summary')
        .select('business_id, avg_rating, rating_count')
        .in('business_id', bids)
        .then(function(res) {
          if (res && res.data) {
            res.data.forEach(function(r) { summaryMap[r.business_id] = r; });
          }
        })
        .catch(function(err) {
          console.warn('[ratings] fetch failed', err);
        });
    }

    function hydrateRatings() {
      var cards = getCards();
      if (!cards.length) return;

      var missingCards = cards.filter(function(card) {
        var body = card.querySelector('.biz-body') || card.querySelector('.featured-biz-body') || card.querySelector('.state-feat-body');
        return !!body && !body.querySelector('.biz-rating-wrap');
      });
      if (!missingCards.length) return;

      var bids = missingCards.reduce(function(acc, c) {
        var b = c.getAttribute('data-business-id');
        if (b && acc.indexOf(b) === -1) acc.push(b);
        return acc;
      }, []);

      fetchSummaries(bids).then(function() {
        missingCards.forEach(function(card) {
          var bid = card.getAttribute('data-business-id');
          inject(card, bid, summaryMap[bid] || null);
        });
      });
    }

    wireEvents(db);
    hydrateRatings();

    if (typeof MutationObserver !== 'undefined') {
      var observer = new MutationObserver(function() {
        if (hydrateTimer) clearTimeout(hydrateTimer);
        hydrateTimer = setTimeout(hydrateRatings, 120);
      });
      observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
