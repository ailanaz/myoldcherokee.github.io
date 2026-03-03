/* ratings.js — anonymous 1-5 star ratings via Supabase
   OldXJS.com — static GitHub Pages
   ─────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var SUPABASE_URL  = 'https://yrwegatjriewuhjyyokm.supabase.co';
  var SUPABASE_KEY  = 'sb_publishable_JuN6TdSeWDJX8DlgqzbHwA_ZHt5hOLS';
  var THROTTLE_MS   = 30 * 24 * 60 * 60 * 1000; // 30 days
  var LS_PREFIX     = 'moc_rated_';

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

  /* ── safe ID for DOM element ids ────────────────────── */
  function sid(bid) {
    return bid.replace(/[^a-z0-9]/gi, '-');
  }

  /* ── build the inner HTML for a .biz-rating-wrap ─────── */
  function buildInner(bid, data) {
    var rated = hasRated(bid);

    /* display line */
    var dispHtml = (data && data.rating_count > 0)
      ? '<span class="biz-rating-stars">\u2605 ' + data.avg_rating + '</span>' +
        '\u00a0<span class="biz-rating-count">(' + data.rating_count + ')</span>'
      : '<span class="biz-rating-none">No ratings yet</span>';

    /* action */
    var actionHtml = rated
      ? '\u00a0<span class="rating-already">· Rated \u2713</span>'
      : '\u00a0<button class="btn btn-outline btn-sm rating-open-btn" data-bid="' + bid + '" aria-expanded="false">Rate</button>';

    /* star form (omitted if already rated) */
    var formHtml = rated ? '' :
      '<div class="rating-form" id="rf-' + sid(bid) + '" aria-hidden="true">' +
        '<div class="star-picker" data-bid="' + bid + '" data-selected="0">' +
          [1, 2, 3, 4, 5].map(function (v) {
            return '<span class="sp-star" data-val="' + v + '" role="button" tabindex="0" aria-label="' + v + ' star">\u2605</span>';
          }).join('') +
        '</div>' +
        '<button class="btn btn-red btn-sm rating-submit-btn" data-bid="' + bid + '" disabled>Submit</button>' +
        '<span class="rating-confirm" style="display:none;">Thanks! \u2713</span>' +
      '</div>';

    return '<div class="biz-rating-row">' + dispHtml + actionHtml + '</div>' + formHtml;
  }

  /* ── inject wrap into a card ─────────────────────────── */
  function inject(card, bid, data) {
    var body = card.querySelector('.biz-body') || card.querySelector('.featured-biz-body');
    if (!body) return;
    if (body.querySelector('.biz-rating-wrap')) return; // already injected

    var wrap = document.createElement('div');
    wrap.className = 'biz-rating-wrap';
    wrap.setAttribute('data-bid', bid);
    wrap.innerHTML = buildInner(bid, data);

    var actions = body.querySelector('.biz-actions') || body.querySelector('.featured-biz-actions');
    if (actions) body.insertBefore(wrap, actions);
    else body.appendChild(wrap);
  }

  /* ── update display after a successful submit ─────────── */
  function refreshDisplay(bid, data) {
    var wrap = document.querySelector('.biz-rating-wrap[data-bid="' + bid + '"]');
    if (!wrap) return;
    var row = wrap.querySelector('.biz-rating-row');
    if (!row) return;
    var dispHtml = (data && data.rating_count > 0)
      ? '<span class="biz-rating-stars">\u2605 ' + data.avg_rating + '</span>' +
        '\u00a0<span class="biz-rating-count">(' + data.rating_count + ')</span>'
      : '<span class="biz-rating-none">No ratings yet</span>';
    row.innerHTML = dispHtml + '\u00a0<span class="rating-already">· Rated \u2713</span>';
  }

  /* ── delegated event listeners (wired once) ──────────── */
  function wireEvents(db) {

    document.addEventListener('click', function (e) {
      var t = e.target;

      /* open / close rating form */
      var openBtn = t.closest ? t.closest('.rating-open-btn') : null;
      if (openBtn) {
        var bid  = openBtn.getAttribute('data-bid');
        var form = document.getElementById('rf-' + sid(bid));
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
        var form   = document.getElementById('rf-' + sid(bid));
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

    var db    = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-business-id]'));
    if (!cards.length) return;

    /* collect unique business_ids */
    var bids = cards.reduce(function (acc, c) {
      var b = c.getAttribute('data-business-id');
      if (b && acc.indexOf(b) === -1) acc.push(b);
      return acc;
    }, []);

    /* single batch fetch of all summaries */
    db.from('business_rating_summary')
      .select('business_id, avg_rating, rating_count')
      .in('business_id', bids)
      .then(function (res) {
        var map = {};
        if (res.data) res.data.forEach(function (r) { map[r.business_id] = r; });

        cards.forEach(function (card) {
          var bid = card.getAttribute('data-business-id');
          inject(card, bid, map[bid] || null);
        });

        wireEvents(db);
      })
      .catch(function (err) {
        console.warn('[ratings] fetch failed', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
