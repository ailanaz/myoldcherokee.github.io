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

function renderGroup(container, title, items) {
  var wrap = document.createElement('div');
  wrap.className = 'card';
  wrap.style.cssText = 'padding:16px;margin-top:16px;border-radius:10px;';

  var h3 = document.createElement('h3');
  h3.style.cssText = 'margin:0 0 0.75rem;font-family:\'Oswald\',sans-serif;font-size:1.05rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;';
  h3.textContent = title;
  wrap.appendChild(h3);

  if (!items.length) {
    var none = document.createElement('p');
    none.style.color = 'var(--text-mid)';
    none.textContent = 'No listings yet for this state.';
    wrap.appendChild(none);
    container.appendChild(wrap);
    return;
  }

  var ul = document.createElement('ul');
  ul.style.cssText = 'list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.6rem;';

  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    var li = document.createElement('li');
    li.style.cssText = 'border:1px solid var(--line);border-radius:8px;padding:0.75rem 1rem;background:var(--off);';

    var name = esc(it.title || it.name || 'Listing');
    var city = it.city ? ' <span style="color:var(--text-mid);font-size:0.88rem;">\u2014 ' + esc(it.city) + ', ' + esc(it.state || '') + '</span>' : '';
    var price = it.price ? ' <span style="color:var(--text-mid);font-size:0.85rem;">(' + esc(it.price) + ')</span>' : '';

    var website = it.website
      ? '<div style="margin-top:0.35rem;"><a href="' + esc(it.website) + '" target="_blank" rel="noopener noreferrer" style="font-size:0.82rem;">' + esc(it.website) + '</a></div>'
      : '';

    var phone = it.phone
      ? '<div style="font-size:0.82rem;color:var(--text-mid);margin-top:0.2rem;">' + esc(it.phone) + '</div>'
      : '';

    var summary = it.summary
      ? '<p style="margin:0.35rem 0 0;font-size:0.87rem;color:var(--text-mid);line-height:1.5;">' + esc(it.summary) + '</p>'
      : '';

    var sourceLink = it.jeep_friendly_source_url
      ? ' <a href="' + esc(it.jeep_friendly_source_url) + '" target="_blank" rel="noopener noreferrer" style="font-size:0.78rem;margin-left:0.4rem;white-space:nowrap;">' + esc(it.jeep_friendly_source_label || 'Source') + ' &rarr;</a>'
      : '';

    var blurb = it.jeep_friendly_blurb
      ? '<p style="margin:0.5rem 0 0;font-size:0.83rem;padding:0.4rem 0.65rem;background:rgba(42,102,72,0.1);border-left:3px solid #2a6648;border-radius:0 4px 4px 0;line-height:1.5;">'
        + '<strong style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:0.15rem;">Jeep-friendly</strong>'
        + esc(it.jeep_friendly_blurb) + sourceLink
        + '</p>'
      : '';

    li.innerHTML = '<strong>' + name + '</strong>' + city + price + website + phone + summary + blurb;
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

    // Only show directory businesses with a confirmed jeep_friendly_blurb
    var directory = dirAll.filter(function(x) {
      return (x.state || '').toUpperCase() === stateCode && x.jeep_friendly_blurb;
    });

    var buySellGroups = groupBy(buySell, 'category');
    var dirGroups = groupBy(directory, 'type');

    var dirOrder = ['Repair Shops', 'Salvage and Junk Yards', 'Shop for Parts and More', 'Other'];

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
