/* state-page.js - shared renderer for all 50-state pages */

/* ── Supabase config (same project as ratings.js) ─────── */
var SUPABASE_URL = 'https://yrwegatjriewuhjyyokm.supabase.co';
var SUPABASE_KEY = 'sb_publishable_JuN6TdSeWDJX8DlgqzbHwA_ZHt5hOLS';

async function fetchJson(url) {
  var res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load ' + url);
  return await res.json();
}

var CONTACT_FORM_ID = 'J928BY';
function openSellerContact(sellerEmail, listingTitle) {
  if (window.Tally) {
    Tally.openPopup(CONTACT_FORM_ID, {
      layout: 'modal',
      overlay: true,
      hiddenFields: { seller_email: sellerEmail, listing_title: listingTitle }
    });
  } else {
    window.location.href = 'https://tally.so/r/' + CONTACT_FORM_ID +
      '?seller_email=' + encodeURIComponent(sellerEmail) +
      '&listing_title=' + encodeURIComponent(listingTitle);
  }
}

function getCatClass(category) {
  var c = String(category || '').toLowerCase();
  if (c.indexOf('vehicle') !== -1) return 'lcat-vehicle';
  if (c.indexOf('project') !== -1) return 'lcat-project';
  if (c.indexOf('wanted') !== -1) return 'lcat-wanted';
  if (c.indexOf('parts') !== -1) return 'lcat-parts';
  return 'lcat-parts';
}

/* Resolves an image URL from a listing record.
   - Supabase Storage URLs (http/https) are used as-is.
   - Legacy relative filenames get the ../ prefix for state pages. */
function getImgSrc(it) {
  var url = it.image_url || it.image || '';
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return '../' + url;
}

function groupBy(items, key) {
  var out = {};
  for (var i = 0; i < items.length; i++) {
    var k = items[i][key] || 'Other';
    if (!out[k]) out[k] = [];
    out[k].push(items[i]);
  }
  return out;
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isFeaturedEntry(it) {
  if (!it) return false;
  if (it.is_featured === true) return true;
  if (String(it.type || '').toLowerCase().indexOf('featured') !== -1) return true;
  if (Array.isArray(it.categories)) {
    for (var i = 0; i < it.categories.length; i++) {
      if (String(it.categories[i] || '').toLowerCase() === 'featured') return true;
    }
  }
  return false;
}

function getWebsiteLabel(websiteHref) {
  var href = String(websiteHref || '');
  if (!href) return 'Website';
  if (/facebook\.com/i.test(href)) return 'Facebook';
  if (/yelp\.com/i.test(href)) return 'Yelp';
  if (/google\.[^/]+\/maps/i.test(href)) return 'Google';
  return 'Website';
}

function buildMapHref(it) {
  if (it.google_maps_link) return it.google_maps_link;
  return 'https://www.google.com/maps/search/' + encodeURIComponent([
    it.name || it.title || '',
    it.address || '',
    it.city || '',
    it.state || ''
  ].join(' ').trim());
}

function renderFeaturedSection(root, stateName, featuredItems) {
  if (!root) return;
  var section = root.querySelector('.state-featured-section');
  if (!section) {
    section = document.createElement('div');
    section.className = 'state-featured-section';
    section.innerHTML = '<div class="state-featured-label"></div><div class="state-featured-track"></div>';
    var anchor = root.querySelector('#state-page');
    if (anchor && anchor.nextSibling) root.insertBefore(section, anchor.nextSibling);
    else if (anchor) root.appendChild(section);
  }

  var label = section.querySelector('.state-featured-label');
  if (label) label.textContent = 'Featured in ' + stateName;
  var track = section.querySelector('.state-featured-track');
  if (!track) return;
  track.innerHTML = '';

  var imgMap = {
    'banker-automotive-tx': '../assets/images/banker-automotive.png',
    'forged-concepts-ar': '../assets/images/forged-concepts-logo.jpg',
    'pidplates-ca': '../PP%20Decals.png?v=20260304-5'
  };
  var imgBgMap = {
    'banker-automotive-tx': '#fff',
    'forged-concepts-ar': '#fff',
    'pidplates-ca': '#c01616'
  };

  var active = (featuredItems || []).slice(0, 3);
  active.forEach(function(it) {
    var card = document.createElement('div');
    card.className = 'state-feat-card';
    card.setAttribute('data-business-id', it.business_id || '');

    var website = (it.website || '').trim();
    var mapHref = buildMapHref(it);
    var websiteLabel = getWebsiteLabel(website);
    var tags = Array.isArray(it.categories) ? it.categories.slice(0, 3) : [];
    var tagHtml = tags.length
      ? '<div class="featured-biz-tags" style="margin-bottom:0.6rem;">' + tags.map(function(t) {
          return '<span class="featured-biz-tag">' + esc(String(t).replace(/-/g, ' ')) + '</span>';
        }).join('') + '</div>'
      : '';
    var type = esc(it.type || 'Business');
    var name = esc(it.name || 'Featured Business');
    var cityState = [it.city, it.state].filter(Boolean).join(', ');
    var loc = cityState ? '📍 ' + esc(cityState) : '';
    var desc = esc(it.summary || 'Featured listing for XJ owners.');
    var imgSrc = imgMap[it.business_id] || '';
    var imgBg = imgBgMap[it.business_id] || '#fff';

    card.innerHTML =
      '<div class="state-feat-img" style="display:flex;align-items:center;justify-content:center;background:' + imgBg + ';">' +
        (imgSrc
          ? '<img src="' + imgSrc + '" alt="' + name + ' logo" style="max-width:92%;max-height:86%;object-fit:contain;" />'
          : '<span style="font-family:\'Oswald\',sans-serif;font-size:1.35rem;letter-spacing:0.06em;">' + name + '</span>') +
      '</div>' +
      '<div class="state-feat-body">' +
        '<div class="state-feat-badges">' +
          '<span class="featured-badge">Featured</span>' +
          '<span class="featured-biz-type">' + type + '</span>' +
        '</div>' +
        '<div class="state-feat-name">' + name + '</div>' +
        '<div class="state-feat-loc">' + loc + '</div>' +
        '<p class="state-feat-desc">' + desc + '</p>' +
        tagHtml +
        '<div class="featured-verified">Business website and service details verified</div>' +
        '<div class="state-feat-actions">' +
          (website ? '<a href="' + esc(website) + '" target="_blank" rel="noopener noreferrer" class="btn btn-red btn-sm">' + websiteLabel + '</a>' : '') +
          '<a href="' + esc(mapHref) + '" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Map</a>' +
        '</div>' +
      '</div>';
    track.appendChild(card);
  });

  while (track.children.length < 3) {
    var inactive = document.createElement('a');
    inactive.href = '../featured.html#get-featured';
    inactive.className = 'state-feat-card state-feat-card--inactive';
    inactive.innerHTML =
      '<div class="state-feat-img--empty">+</div>' +
      '<div class="state-feat-placeholder-body">' +
        '<div class="state-feat-placeholder-title">Get Featured Here</div>' +
        '<p class="state-feat-placeholder-sub">Repair shop, parts seller, or service business in ' + esc(stateName) + '? Get your business in front of XJ owners.</p>' +
        '<span class="btn btn-red btn-sm">Learn More &rarr;</span>' +
      '</div>';
    track.appendChild(inactive);
  }
}

function renderDirectoryRunningList(container, items, ratingsMap) {
  if (!container) return;
  container.innerHTML = '';

  var heading = document.createElement('div');
  heading.className = 'state-featured-label';
  heading.style.marginTop = '2rem';
  heading.textContent = 'Directory';
  container.appendChild(heading);

  var wrap = document.createElement('div');
  wrap.className = 'card';
  wrap.style.cssText = 'padding:16px;margin-top:16px;border-radius:10px;';
  container.appendChild(wrap);

  if (!items.length) {
    wrap.innerHTML = '<p style="margin:0;color:var(--text-mid);">No active directory listings yet for this state.</p>';
    return;
  }

  var ul = document.createElement('ul');
  ul.style.cssText = 'list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.75rem;';

  items.slice().sort(function(a, b) {
    return String(a.name || '').toLowerCase().localeCompare(String(b.name || '').toLowerCase());
  }).forEach(function(it) {
    var li = document.createElement('li');
    li.className = 'card';
    li.setAttribute('data-business-id', it.business_id || '');
    li.style.cssText = 'padding:0.8rem 0.95rem;background:var(--off);border:1px solid var(--line);';

    var isFeat = isFeaturedEntry(it);
    var website = (it.website || '').trim();
    var mapHref = buildMapHref(it);
    var websiteLabel = getWebsiteLabel(website);
    var type = esc(it.type || 'Business');
    var name = esc(it.name || 'Listing');
    var cityState = [it.city, it.state].filter(Boolean).join(', ');
    var address = it.address ? '<div style="font-size:0.82rem;color:var(--text-mid);margin-top:0.2rem;">📍 ' + esc(it.address) + '</div>' : '';

    var tags = Array.isArray(it.categories) ? it.categories.filter(function(t){ return String(t).toLowerCase() !== 'featured'; }).slice(0, 3) : [];
    var tagsHtml = tags.length
      ? '<div style="display:flex;gap:0.35rem;flex-wrap:wrap;margin-top:0.35rem;">' + tags.map(function(t){
          return '<span class="featured-biz-tag">' + esc(String(t).replace(/-/g, ' ')) + '</span>';
        }).join('') + '</div>'
      : '';

    var ratingData = ratingsMap && ratingsMap[it.business_id];
    var ratingAvg = (ratingData && ratingData.avg_rating != null) ? Number(ratingData.avg_rating) : 0;
    var ratingCount = (ratingData && ratingData.rating_count != null) ? Number(ratingData.rating_count) : 0;
    var ratingInner = '<div class="biz-rating-row">' +
      '<span class="biz-rating-stars">\u2605 ' + ratingAvg.toFixed(1) + '</span>' +
      '\u00a0<span class="biz-rating-count">(' + ratingCount + ')</span>' +
      '</div>';
    var ratingHtml = '<div class="biz-rating-wrap" data-bid="' + esc(it.business_id || '') + '" style="margin-top:0.3rem;">' + ratingInner + '</div>';

    var star = isFeat
      ? '<span class="featured-badge" style="width:1.6rem;height:1.6rem;justify-content:center;font-size:0.9rem;padding:0;border-radius:50%;letter-spacing:0;margin-right:0.35rem;vertical-align:middle;flex-shrink:0;">&#9733;</span>'
      : '';

    var buttons = isFeat
      ? (website ? '<a href="' + esc(website) + '" target="_blank" rel="noopener noreferrer" class="btn btn-red btn-sm">' + websiteLabel + '</a>' : '') +
        '<a href="' + esc(mapHref) + '" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Map</a>'
      : (website
          ? '<a href="' + esc(website) + '" target="_blank" rel="noopener noreferrer" class="btn btn-red btn-sm">' + websiteLabel + '</a>'
          : '<a href="' + esc(mapHref) + '" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Map</a>');

    li.innerHTML =
      '<div class="biz-body">' +
        '<div style="display:flex;justify-content:space-between;gap:0.75rem;flex-wrap:wrap;align-items:flex-start;">' +
          '<div style="display:flex;align-items:flex-start;gap:0;">' +
            star +
            '<div>' +
              '<div style="font-family:\'Oswald\',sans-serif;font-size:1rem;font-weight:700;letter-spacing:0.02em;">' + name + '</div>' +
              '<div style="font-size:0.84rem;color:var(--text-mid);">' + esc(cityState) + (cityState ? ' · ' : '') + type + '</div>' +
              address +
              tagsHtml +
              ratingHtml +
            '</div>' +
          '</div>' +
          '<div class="biz-actions" style="display:flex;gap:0.45rem;flex-wrap:wrap;justify-content:flex-end;">' +
            buttons +
          '</div>' +
        '</div>' +
      '</div>';
    ul.appendChild(li);
  });

  wrap.appendChild(ul);
}

function renderGroup(container, title, items) {
  if (!items || !items.length) return;

  var wrap = document.createElement('div');
  wrap.style.cssText = 'margin-top:1.5rem;';

  var label = document.createElement('div');
  label.className = 'state-featured-label';
  label.textContent = title;
  wrap.appendChild(label);

  var grid = document.createElement('div');
  grid.className = 'grid g3';
  wrap.appendChild(grid);

  items.forEach(function(it) {
    var stateCode = (it.state || '-').toUpperCase();
    var cityState = [it.city, it.state].filter(Boolean).join(', ');
    var price = String(it.price || '');
    var imgSrc = getImgSrc(it);
    var hasImage = !!imgSrc;
    var catClass = getCatClass(it.category);

    var imageHtml = hasImage
      ? '<div class="listing-image-wrap"><img src="' + esc(imgSrc) + '" alt="' + esc(it.title || '') + '" loading="lazy"><span class="listing-state">' + esc(stateCode) + '</span></div>'
      : '<div class="listing-image-wrap listing-no-photo"><span class="listing-state">' + esc(stateCode) + '</span></div>';

    var safeEmail = String(it.seller_email || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    var safeTitle = String(it.title || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    var contactBtn = it.seller_email
      ? '<button class="btn btn-red btn-sm" onclick="openSellerContact(\'' + safeEmail + '\',\'' + safeTitle + '\')">Get in Touch</button>'
      : '<a href="../submit.html" class="btn btn-outline btn-sm">Get Started</a>';

    var card = document.createElement('div');
    card.className = 'listing-card';
    card.innerHTML =
      imageHtml +
      '<div class="listing-body">' +
        '<div class="listing-cats"><span class="lcat ' + catClass + '">' + esc(title) + '</span></div>' +
        '<div class="listing-name">' + esc(it.title || it.name || 'Listing') + '</div>' +
        (cityState ? '<div class="listing-loc">\uD83D\uDCCD ' + esc(cityState) + '</div>' : '') +
        (price ? '<div class="listing-price">' + esc(price) + '</div>' : '') +
        (it.summary ? '<p class="listing-summary">' + esc(it.summary) + '</p>' : '') +
        '<div class="listing-actions">' + contactBtn + '</div>' +
      '</div>';
    grid.appendChild(card);
  });

  container.appendChild(wrap);
}

function renderSection(container, sectionTitle, groups, orderedKeys) {
  var heading = document.createElement('div');
  heading.className = 'state-featured-label';
  heading.style.marginTop = '2rem';
  heading.textContent = sectionTitle;
  container.appendChild(heading);

  // Flatten all groups into one combined list - no per-category sub-headers
  var allItems = [];
  var keys = Object.keys(groups).sort();
  if (orderedKeys) {
    orderedKeys.forEach(function(k) { if (groups[k]) allItems = allItems.concat(groups[k]); });
    keys.forEach(function(k) { if (orderedKeys.indexOf(k) === -1 && groups[k]) allItems = allItems.concat(groups[k]); });
  } else {
    keys.forEach(function(k) { allItems = allItems.concat(groups[k]); });
  }

  if (allItems.length) {
    var grid = document.createElement('div');
    grid.className = 'grid g3';
    grid.style.marginTop = '1rem';

    allItems.forEach(function(it) {
      var stateCode = (it.state || '-').toUpperCase();
      var cityState = [it.city, it.state].filter(Boolean).join(', ');
      var price = String(it.price || '');
      var imgSrc = getImgSrc(it);
      var hasImage = !!imgSrc;
      var catClass = getCatClass(it.category);
      var catLabel = esc(it.category || '');

      var imageHtml = hasImage
        ? '<div class="listing-image-wrap"><img src="' + esc(imgSrc) + '" alt="' + esc(it.title || '') + '" loading="lazy"><span class="listing-state">' + esc(stateCode) + '</span></div>'
        : '<div class="listing-image-wrap listing-no-photo"><span class="listing-state">' + esc(stateCode) + '</span></div>';

      var safeEmail = String(it.seller_email || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      var safeTitle = String(it.title || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      var contactBtn = it.seller_email
        ? '<button class="btn btn-red btn-sm" onclick="openSellerContact(\'' + safeEmail + '\',\'' + safeTitle + '\')">Get in Touch</button>'
        : '<a href="../submit.html" class="btn btn-outline btn-sm">Get Started</a>';

      var card = document.createElement('div');
      card.className = 'listing-card';
      card.innerHTML =
        imageHtml +
        '<div class="listing-body">' +
          '<div class="listing-cats"><span class="lcat ' + catClass + '">' + catLabel + '</span></div>' +
          '<div class="listing-name">' + esc(it.title || it.name || 'Listing') + '</div>' +
          (cityState ? '<div class="listing-loc">\uD83D\uDCCD ' + esc(cityState) + '</div>' : '') +
          (price ? '<div class="listing-price">' + esc(price) + '</div>' : '') +
          (it.summary ? '<p class="listing-summary">' + esc(it.summary) + '</p>' : '') +
          '<div class="listing-actions">' + contactBtn + '</div>' +
        '</div>';
      grid.appendChild(card);
    });

    container.appendChild(grid);
    return;
  }

  // If no groups at all, show a placeholder
  if (!Object.keys(groups).length) {
    if (sectionTitle === 'Buy & Sell') {
      var inactiveWrap = document.createElement('div');
      inactiveWrap.style.cssText = 'margin-top:1rem;';
      inactiveWrap.innerHTML =
        '<div class="grid g3">' +
          '<a href="../submit.html" class="listing-card listing-card--inactive">' +
            '<div class="listing-image-wrap listing-no-photo"><span class="listing-state">-</span></div>' +
            '<div class="listing-body">' +
              '<div class="listing-cats"><span class="lcat lcat-wanted">Wanted</span></div>' +
              '<div class="listing-name">Looking for a Cherokee Part?</div>' +
              '<p class="listing-summary">Post a wanted ad and let Cherokee owners in this state come to you.</p>' +
              '<span class="btn btn-outline btn-sm">Post a Wanted Ad</span>' +
            '</div>' +
          '</a>' +
          '<a href="../submit.html" class="listing-card listing-card--inactive">' +
            '<div class="listing-image-wrap listing-no-photo"><span class="listing-state">-</span></div>' +
            '<div class="listing-body">' +
              '<div class="listing-cats"><span class="lcat lcat-parts">Parts</span></div>' +
              '<div class="listing-name">Used Cherokee Parts</div>' +
              '<p class="listing-summary">No active parts listings yet for this state. Add yours to be first.</p>' +
              '<span class="btn btn-amber btn-sm">Post Parts</span>' +
            '</div>' +
          '</a>' +
          '<div class="listing-card-submit">' +
            '<div style="font-size:2.5rem;">📋</div>' +
            '<h3>Post a Listing</h3>' +
            '<p>Buying, selling, or looking for something specific? Submit a listing and connect with other Cherokee owners.</p>' +
            '<a href="../submit.html" class="btn btn-red btn-sm">Get Started</a>' +
          '</div>' +
        '</div>';
      container.appendChild(inactiveWrap);
      return;
    }

    var none = document.createElement('div');
    none.style.cssText = 'background:var(--off);border:1.5px dashed var(--line-mid);border-radius:10px;padding:2rem;text-align:center;margin-top:1rem;color:var(--text-mid);';
    none.innerHTML = 'No confirmed ' + sectionTitle.toLowerCase() + ' listings yet for this state. <a href="../submit.html">Submit one.</a>';
    container.appendChild(none);
  }
}

/* ── Fetch active listings for a state from Supabase ─── */
async function fetchListingsForState(stateCode) {
  if (!window.supabase || !window.supabase.createClient) {
    // Supabase SDK not available - fall back to static JSON
    var buySellAll = await fetchJson('../assets/data/buy-sell.json');
    return buySellAll.filter(function(x) {
      return (x.state || '').toUpperCase() === stateCode &&
        (x.is_active === true || String(x.status || '').toLowerCase() === 'active');
    });
  }

  var db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  var res = await db
    .from('listings')
    .select('id, title, category, state, city, price, summary, image_url, seller_email, created_at')
    .eq('state', stateCode)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (res.error) {
    console.warn('[state-page] Supabase listings fetch failed, falling back to JSON', res.error);
    // Fall back to static JSON
    var buySellAll = await fetchJson('../assets/data/buy-sell.json');
    return buySellAll.filter(function(x) {
      return (x.state || '').toUpperCase() === stateCode &&
        (x.is_active === true || String(x.status || '').toLowerCase() === 'active');
    });
  }

  return res.data || [];
}

async function initStatePage() {
  var root = document.getElementById('state-page');
  if (!root) return;

  var stateCode = (root.getAttribute('data-state') || '').toUpperCase();
  var stateName = root.getAttribute('data-state-name') || '';

  var titleEl = document.getElementById('state-title');
  if (titleEl) titleEl.textContent = stateName;

  var heroSubEl = document.getElementById('state-hero-sub');
  if (heroSubEl) heroSubEl.remove();

  var bsContainer = document.getElementById('state-buy-sell');
  var dirContainer = document.getElementById('state-directory');
  if (bsContainer && dirContainer && bsContainer.parentNode === dirContainer.parentNode) {
    bsContainer.parentNode.insertBefore(dirContainer, bsContainer);
  }

  try {
    var results = await Promise.all([
      fetchListingsForState(stateCode),
      fetchJson('../assets/data/directory.json')
    ]);

    var activeBuySell = results[0];
    var dirAll = results[1];

    // Show all directory businesses for the state (free cards may have limited fields).
    var directory = dirAll.filter(function(x) {
      return (x.state || '').toUpperCase() === stateCode;
    });
    var activeDirectory = directory.filter(function(x) {
      return x.is_active === true || String(x.status || '').toLowerCase() === 'active';
    });
    var featuredDirectory = activeDirectory.filter(isFeaturedEntry);
    var runningDirectory = activeDirectory.filter(function(x) { return !isFeaturedEntry(x); });

    var buySellGroups = groupBy(activeBuySell, 'category');
    var sectionRoot = root.parentElement || document;
    renderFeaturedSection(sectionRoot, stateName, featuredDirectory);

    renderSection(bsContainer, 'Buy & Sell', buySellGroups, null);

    // Fetch star ratings for directory businesses
    var ratingsMap = {};
    try {
      if (window.supabase && window.supabase.createClient && runningDirectory.length) {
        var ratingDb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        var bizIds = runningDirectory.map(function(x) { return x.business_id; }).filter(Boolean);
        if (bizIds.length) {
          var ratingRes = await ratingDb
            .from('business_rating_summary')
            .select('business_id, avg_rating, rating_count')
            .in('business_id', bizIds);
          if (ratingRes.data) {
            ratingRes.data.forEach(function(r) { ratingsMap[r.business_id] = r; });
          }
        }
      }
    } catch(e) { /* ratings are non-critical */ }

    renderDirectoryRunningList(dirContainer, runningDirectory, ratingsMap);

  } catch (err) {
    if (bsContainer) bsContainer.innerHTML = '<p style="color:var(--text-mid);padding:1rem 0;">Listings could not load. Please refresh the page.</p>';
    if (dirContainer) dirContainer.innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  initStatePage();
});
