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

    var buySellGroups = groupBy(activeBuySell, 'category');
    var dirGroups = groupBy(directory, 'type');

    var dirOrder = [
      'Repair Shops (XJ/Jeep-Friendly)',
      'Suspension, Alignment, and Lift Install',
      'Drivetrain Specialists (Axles, Gears, Driveshafts)',
      'Electrical and Diagnostics (Older Vehicle Friendly)',
      'Radiator and Cooling Specialists',
      'Auto Glass and Windshield',
      'Fabrication and Welding (4x4)',
      'Rust Repair and Body (Welding Focus)',
      'Upholstery and Interior (Headliners, Seats)',
      'Towing and Recovery (4x4 capable)',
      'Specialty Services',
      'Salvage Yards and Junkyards (Used Jeep Parts)',
      'Parts Shops and 4x4 Retailers',
      'Body Shops',
      'Tires and Wheels',
      'Other'
    ];

    renderSection(bsContainer, 'Buy and Sell', buySellGroups, null);
    renderSection(dirContainer, 'Directory', dirGroups, dirOrder);

  } catch (err) {
    if (bsContainer) bsContainer.innerHTML = '<p style="color:var(--text-mid);padding:1rem 0;">Listings could not load. Please refresh the page.</p>';
    if (dirContainer) dirContainer.innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  initStatePage();
});
