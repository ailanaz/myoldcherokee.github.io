/* state-page.js — shared renderer for all 50-state pages */

async function fetchJson(url) {
  var res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load ' + url);
  return await res.json();
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

function renderDirectoryRunningList(container, items) {
  if (!container) return;
  container.innerHTML = '';

  var heading = document.createElement('h2');
  heading.style.cssText = 'margin:2rem 0 0;font-family:\'Oswald\',sans-serif;font-size:1.3rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;border-bottom:2px solid var(--line);padding-bottom:0.5rem;';
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

    li.innerHTML =
      '<div class="biz-body">' +
        '<div style="display:flex;justify-content:space-between;gap:0.75rem;flex-wrap:wrap;align-items:flex-start;">' +
          '<div>' +
            '<div style="font-family:\'Oswald\',sans-serif;font-size:1rem;font-weight:700;letter-spacing:0.02em;">' + name + '</div>' +
            '<div style="font-size:0.84rem;color:var(--text-mid);">' + esc(cityState) + (cityState ? ' · ' : '') + type + '</div>' +
            address +
            tagsHtml +
          '</div>' +
          '<div class="biz-actions" style="display:flex;gap:0.45rem;flex-wrap:wrap;justify-content:flex-end;">' +
            (website ? '<a href="' + esc(website) + '" target="_blank" rel="noopener noreferrer" class="btn btn-red btn-sm">' + websiteLabel + '</a>' : '') +
            '<a href="' + esc(mapHref) + '" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Map</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    ul.appendChild(li);
  });

  wrap.appendChild(ul);
}

function renderGroup(container, title, items) {
  var sortedItems = (items || []).slice().sort(function(a, b) {
    var an = String(a.name || a.title || '').toLowerCase();
    var bn = String(b.name || b.title || '').toLowerCase();
    if (an !== bn) return an < bn ? -1 : 1;
    var ac = String(a.city || '').toLowerCase();
    var bc = String(b.city || '').toLowerCase();
    if (ac !== bc) return ac < bc ? -1 : 1;
    return 0;
  });

  var wrap = document.createElement('div');
  wrap.className = 'card';
  wrap.style.cssText = 'padding:16px;margin-top:16px;border-radius:10px;';

  var h3 = document.createElement('h3');
  h3.style.cssText = 'margin:0 0 0.75rem;font-family:\'Oswald\',sans-serif;font-size:1.05rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;';
  h3.textContent = title;
  wrap.appendChild(h3);

  if (!sortedItems.length) {
    var none = document.createElement('p');
    none.style.color = 'var(--text-mid)';
    none.textContent = 'No listings yet for this state.';
    wrap.appendChild(none);
    container.appendChild(wrap);
    return;
  }

  var ul = document.createElement('ul');
  ul.style.cssText = 'list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.6rem;';

  for (var i = 0; i < sortedItems.length; i++) {
    var it = sortedItems[i];
    var li = document.createElement('li');
    li.style.cssText = 'border:1px solid var(--line);border-radius:8px;padding:0.75rem 1rem;background:var(--off);';
    var isDirectoryCard = !!it.type;
    var isFeaturedCard = isDirectoryCard && isFeaturedEntry(it);

    var name = esc(it.title || it.name || 'Listing');
    var city = it.city ? ' <span style="color:var(--text-mid);font-size:0.88rem;">\u2014 ' + esc(it.city) + ', ' + esc(it.state || '') + '</span>' : '';
    var price = it.price ? ' <span style="color:var(--text-mid);font-size:0.85rem;">(' + esc(it.price) + ')</span>' : '';
    var address = it.address
      ? '<div style="font-size:0.82rem;color:var(--text-mid);margin-top:0.22rem;">\u{1F4CD} ' + esc(it.address) + '</div>'
      : '';

    var mapHref = it.google_maps_link
      ? it.google_maps_link
      : ('https://www.google.com/maps/search/' + encodeURIComponent([it.name || it.title || '', it.address || '', it.city || '', it.state || ''].join(' ').trim()));
    var websiteLabel = 'Website';
    var websiteHref = (it.website || '').trim();
    if (/yelp\.com/i.test(websiteHref)) websiteLabel = 'Yelp';
    if (/google\.[^/]+\/maps/i.test(websiteHref)) websiteLabel = 'Google';
    var links = [];
    if (websiteHref) {
      links.push('<a href="' + esc(websiteHref) + '" target="_blank" rel="noopener noreferrer" style="font-size:0.82rem;">' + websiteLabel + '</a>');
    }
    if (mapHref) {
      links.push('<a href="' + esc(mapHref) + '" target="_blank" rel="noopener noreferrer" style="font-size:0.82rem;">Map</a>');
    }
    var linkLine = links.length
      ? '<div style="margin-top:0.35rem;display:flex;gap:0.55rem;flex-wrap:wrap;">' + links.join('') + '</div>'
      : '';

    var phone = it.phone
      ? '<div style="font-size:0.82rem;color:var(--text-mid);margin-top:0.2rem;">' + esc(it.phone) + '</div>'
      : '';

    var summary = (!isDirectoryCard && it.summary)
      ? '<p style="margin:0.35rem 0 0;font-size:0.87rem;color:var(--text-mid);line-height:1.5;">' + esc(it.summary) + '</p>'
      : '';

    var star = isFeaturedCard
      ? '<span class="featured-badge" style="width:1.8rem;height:1.8rem;justify-content:center;font-size:1rem;padding:0;border-radius:50%;letter-spacing:0;margin-right:0.35rem;vertical-align:middle;">★</span>'
      : '';
    li.innerHTML = star + '<strong>' + name + '</strong>' + city + price + address + linkLine + phone + summary;
    ul.appendChild(li);
  }

  wrap.appendChild(ul);
  container.appendChild(wrap);
}

function renderSection(container, sectionTitle, groups, orderedKeys) {
  var heading = document.createElement('h2');
  heading.style.cssText = 'margin:2rem 0 0;font-family:\'Oswald\',sans-serif;font-size:1.3rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;border-bottom:2px solid var(--line);padding-bottom:0.5rem;';
  heading.textContent = sectionTitle;
  container.appendChild(heading);

  // Render in specified order first
  var rendered = {};
  if (orderedKeys) {
    for (var i = 0; i < orderedKeys.length; i++) {
      var k = orderedKeys[i];
      if (groups[k]) {
        renderGroup(container, k, groups[k]);
        rendered[k] = true;
      }
    }
  }

  // Render any remaining keys alphabetically
  var remaining = Object.keys(groups).sort();
  for (var j = 0; j < remaining.length; j++) {
    if (!rendered[remaining[j]]) {
      renderGroup(container, remaining[j], groups[remaining[j]]);
    }
  }

  // If no groups at all, show a placeholder
  if (!Object.keys(groups).length) {
    if (sectionTitle === 'Buy and Sell') {
      var inactiveWrap = document.createElement('div');
      inactiveWrap.style.cssText = 'margin-top:1rem;';
      inactiveWrap.innerHTML =
        '<div class="grid g4">' +
          '<a href="../submit.html" class="listing-card listing-card--inactive">' +
            '<div class="listing-image-wrap listing-no-photo"><span class="listing-state">—</span></div>' +
            '<div class="listing-body">' +
              '<div class="listing-cats"><span class="lcat lcat-wanted">Wanted</span></div>' +
              '<div class="listing-name">Looking for a Cherokee Part?</div>' +
              '<p class="listing-summary">Post a wanted ad and let Cherokee owners in this state come to you.</p>' +
              '<span class="btn btn-outline btn-sm">Post a Wanted Ad</span>' +
            '</div>' +
          '</a>' +
          '<a href="../submit.html" class="listing-card listing-card--inactive">' +
            '<div class="listing-image-wrap listing-no-photo"><span class="listing-state">—</span></div>' +
            '<div class="listing-body">' +
              '<div class="listing-cats"><span class="lcat lcat-parts">Parts</span></div>' +
              '<div class="listing-name">Used Cherokee Parts</div>' +
              '<p class="listing-summary">No active parts listings yet for this state. Add yours to be first.</p>' +
              '<span class="btn btn-amber btn-sm">Post Parts</span>' +
            '</div>' +
          '</a>' +
          '<div class="listing-card-submit">' +
            '<div style="font-size:2.5rem;">📋</div>' +
            '<h3>Selling Your Old Cherokee?</h3>' +
            '<p>Post a vehicle, parts, project Cherokee, or wanted listing in this state.</p>' +
            '<a href="../submit.html" class="btn btn-red btn-sm">List with Us</a>' +
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

async function initStatePage() {
  var root = document.getElementById('state-page');
  if (!root) return;

  var stateCode = (root.getAttribute('data-state') || '').toUpperCase();
  var stateName = root.getAttribute('data-state-name') || '';

  var titleEl = document.getElementById('state-title');
  if (titleEl) titleEl.textContent = stateName;

  var heroSubEl = document.getElementById('state-hero-sub');
  if (heroSubEl) heroSubEl.textContent = 'Cherokee listings, shops, and salvage yards across ' + stateName + '.';

  var bsContainer = document.getElementById('state-buy-sell');
  var dirContainer = document.getElementById('state-directory');
  if (bsContainer && dirContainer && bsContainer.parentNode === dirContainer.parentNode) {
    bsContainer.parentNode.insertBefore(dirContainer, bsContainer);
  }

  try {
    var data = await Promise.all([
      fetchJson('../assets/data/buy-sell.json'),
      fetchJson('../assets/data/directory.json')
    ]);

    var buySellAll = data[0];
    var dirAll = data[1];

    var buySell = buySellAll.filter(function(x) {
      return (x.state || '').toUpperCase() === stateCode;
    });

    // Render only active buy/sell records on state pages.
    // This prevents sample/fake seed listings from appearing.
    var activeBuySell = buySell.filter(function(x) {
      return x.is_active === true || String(x.status || '').toLowerCase() === 'active';
    });

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

    renderSection(bsContainer, 'Buy and Sell', buySellGroups, null);
    renderDirectoryRunningList(dirContainer, runningDirectory);

  } catch (err) {
    if (bsContainer) bsContainer.innerHTML = '<p style="color:var(--text-mid);padding:1rem 0;">Listings could not load. Please refresh the page.</p>';
    if (dirContainer) dirContainer.innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  initStatePage();
});
