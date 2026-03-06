/* tag-colors.js
   Applies distinct per-label colors to category/tag pills sitewide.
   Fixed palette for all known tags; hash-based fallback for unknowns.
*/
(function () {
  'use strict';

  /* ─── Fixed palette ────────────────────────────────────────────
     Keys are normalized (trimmed, lowercased, decoded HTML entities).
     Color families keep related tags in the same hue family.
  ────────────────────────────────────────────────────────────── */
  var PALETTE = {

    /* ── GREEN  — actionable / healthy ── */
    'for sale':                        { bg:'#dff2e3', border:'#6ab97d', text:'#1a5c2e' },
    'wanted':                          { bg:'#d6f0e0', border:'#52b06a', text:'#155228' },
    'general repair':                  { bg:'#e0f2e8', border:'#64b87a', text:'#1c5e32' },
    'repair · general':                { bg:'#e0f2e8', border:'#64b87a', text:'#1c5e32' },
    'repair · general & suspension':   { bg:'#daf0e3', border:'#5ab472', text:'#185a2c' },
    'repair · jeep specialist':        { bg:'#d8f0e1', border:'#56b06e', text:'#16582a' },
    'repair · off-road':               { bg:'#d5efde', border:'#50aa68', text:'#145426' },
    'club support':                    { bg:'#dff5e6', border:'#68c07e', text:'#1d6234' },
    'jeep friendly':                   { bg:'#d8f5ea', border:'#35b88b', text:'#0f5a42' },
    'lift kits':                       { bg:'#dcf0e2', border:'#5eb676', text:'#186030' },
    'tires & wheels · lift kits':      { bg:'#dbf0e1', border:'#5cb474', text:'#175e2e' },
    'tires & wheels · off-road':       { bg:'#d8f0de', border:'#56b06c', text:'#145a28' },
    'tires & wheels · off-road parts': { bg:'#d5efdb', border:'#50aa66', text:'#125626' },

    /* ── TEAL  — 4x4 / off-road / suspension ── */
    'suspension':                      { bg:'#d6f0ed', border:'#3db8aa', text:'#0c4f46' },
    'steering / suspension':           { bg:'#d4eeeb', border:'#3ab4a6', text:'#0a4b42' },
    '4x4 & off-road · suspension':     { bg:'#d2ede9', border:'#38b0a2', text:'#08473e' },
    'repair · 4x4 specialist':         { bg:'#d0ece7', border:'#35ac9e', text:'#07453c' },
    'repair · driveline & 4x4':        { bg:'#ceeae5', border:'#32a89a', text:'#064138' },
    'know your vin':                   { bg:'#d8f0ec', border:'#42bca6', text:'#0e5347' },
    'tires & wheels · alignment':      { bg:'#d3ecea', border:'#3aaea4', text:'#094946' },

    /* ── BLUE  — cooling / info / reference ── */
    'cooling':                         { bg:'#ddeaf7', border:'#5b9fd4', text:'#14437a' },
    'cooling · radiator':              { bg:'#dae8f7', border:'#579cd2', text:'#123f76' },
    'repair · ase certified':          { bg:'#dbe9f6', border:'#5899d0', text:'#133c72' },
    'body shop · fca jeep certified':  { bg:'#d9e7f5', border:'#5596ce', text:'#11396e' },
    'body shop · jeep certified':      { bg:'#d7e6f5', border:'#5294cc', text:'#10376a' },
    'parts shop':                      { bg:'#d8e8f6', border:'#5497d0', text:'#123a6e' },
    'salvage · jeep specialist':       { bg:'#d5e6f4', border:'#4f92ca', text:'#0f3468' },
    'reference':                       { bg:'#dce9f5', border:'#5c9cd2', text:'#154472' },
    'service manuals':                 { bg:'#daeaf6', border:'#599fd4', text:'#134174' },
    'manchaca tx':                     { bg:'#d8e8f6', border:'#5497d0', text:'#123a6e' },
    'your city tx':                    { bg:'#d5e6f4', border:'#4f92ca', text:'#0f3468' },

    /* ── AMBER  — electrical / power / tools ── */
    'electrical':                      { bg:'#fef0cc', border:'#e8a820', text:'#7a4d00' },
    'electrical · diagnostics':        { bg:'#fdedc4', border:'#e4a01a', text:'#764800' },
    'lighting':                        { bg:'#fef2d0', border:'#eaad24', text:'#7c5200' },
    'bring tools':                     { bg:'#feeec8', border:'#e6a618', text:'#784a00' },
    'featured placement':              { bg:'#feefca', border:'#e7a91c', text:'#7a4f00' },
    'body shop · i-car gold class':    { bg:'#feecc0', border:'#e2a014', text:'#724500' },

    /* ── ORANGE  — project / urgent search ── */
    'project':                         { bg:'#fde8d8', border:'#e8925a', text:'#7a3010' },
    'search first':                    { bg:'#fde4d0', border:'#e48a50', text:'#762a08' },
    'decals':                          { bg:'#fde2cc', border:'#e08848', text:'#743008' },
    'body protection':                 { bg:'#fce0c8', border:'#dc8440', text:'#703006' },
    'exterior':                        { bg:'#fce4d0', border:'#e08c4c', text:'#723208' },

    /* ── RED  — warnings / damage / no-go ── */
    'not for sale':                    { bg:'#fde0e4', border:'#e0717f', text:'#7d1025' },
    'body shop · collision':           { bg:'#fcdde2', border:'#dc6a78', text:'#7a0e22' },
    'body shop · collision & refinish':{ bg:'#fcdae0', border:'#d8647a', text:'#770c20' },
    'body shop · paint & collision':   { bg:'#fbd8de', border:'#d45e74', text:'#740a1e' },

    /* ── PURPLE  — xj brand / specialty / engine ── */
    'xj':                              { bg:'#ece3fa', border:'#9b72db', text:'#421d87' },
    'xj / zj / wj':                   { bg:'#ebe0fa', border:'#976ed8', text:'#401b84' },
    'engine':                          { bg:'#e9def8', border:'#9368d4', text:'#3d1880' },
    'engine sensors':                  { bg:'#e7dbf8', border:'#8f64d0', text:'#3a157c' },
    'salvage · xj specialist':         { bg:'#e5d8f6', border:'#8b60cc', text:'#381278' },
    'specialty services':              { bg:'#eae0fa', border:'#9970d8', text:'#421d84' },
    'accessories':                     { bg:'#eee5fa', border:'#a07edd', text:'#461f88' },
    'accessories & gear':              { bg:'#eee5fa', border:'#a07edd', text:'#461f88' },
    'custom badges':                   { bg:'#ede2fa', border:'#9c76da', text:'#441f86' },

    /* ── PINK/ROSE  — body / interior / cosmetic ── */
    'body & interior':                 { bg:'#fde0ee', border:'#e07aaa', text:'#7d1248' },
    'interior':                        { bg:'#fddaeb', border:'#dc6ea4', text:'#7a1044' },
    'armor':                           { bg:'#fcdaea', border:'#d86aa0', text:'#770e42' },

    /* ── SLATE  — salvage / neutral / worn ── */
    'salvage · full-service':          { bg:'#e4eaef', border:'#8da8bb', text:'#2c4558' },
    'salvage · jeep & chrysler':       { bg:'#e2e8ed', border:'#8aa4b8', text:'#2a4254' },
    'salvage · self-service':          { bg:'#e0e7ec', border:'#88a0b5', text:'#283e50' },
    'junk / salvage yard':             { bg:'#dfe6eb', border:'#869eb2', text:'#263c4e' },
    'tires & wheels':                  { bg:'#e6ebef', border:'#92aabc', text:'#2e485a' },
    'repair · tire & alignment':       { bg:'#e3e9ee', border:'#8ea6ba', text:'#2c4456' },
    'parts':                           { bg:'#e5eaee', border:'#90a8ba', text:'#2c4658' },
    'repair shop':                     { bg:'#e1e8ed', border:'#8ca4b8', text:'#2a4254' },

    /* ── BROWN/COPPER  — drivetrain / fabrication / grounds ── */
    'drivetrain':                      { bg:'#f0e4d8', border:'#c09070', text:'#5c3010' },
    'repair · transmission & general': { bg:'#eee0d4', border:'#bc8a6c', text:'#5a2e0e' },
    'fabrication & welding (4x4)':     { bg:'#ecdcd0', border:'#b8846a', text:'#582c0c' },
    'bumpers':                         { bg:'#eadad0', border:'#b48068', text:'#562a0a' },
    'skid plate':                      { bg:'#e8d8ce', border:'#b07c66', text:'#542808' },
    'sliders':                         { bg:'#e6d6cc', border:'#ac7864', text:'#522606' },

    /* ── GUIDE CARD TAGS (from guides.json) ── */
    'spark / fuel':                    { bg:'#fde8d8', border:'#e8925a', text:'#7a3010' },
    'no crank':                        { bg:'#fde0e4', border:'#e0717f', text:'#7d1025' },
    'idle / vacuum':                   { bg:'#ece3fa', border:'#9b72db', text:'#421d87' },
    'lean / idle':                     { bg:'#eae0fa', border:'#9970d8', text:'#421d84' },
    'tb / iac':                        { bg:'#e9def8', border:'#9368d4', text:'#3d1880' },
    'long crank':                      { bg:'#fde0e4', border:'#e0717f', text:'#7d1025' },
    'fuel pump':                       { bg:'#fde8d8', border:'#e8925a', text:'#7a3010' },
    'heat soak':                       { bg:'#fde8d8', border:'#e8925a', text:'#7a3010' },
    'common issues':                   { bg:'#fde0e4', border:'#e0717f', text:'#7d1025' },
    'baseline':                        { bg:'#dff2e3', border:'#6ab97d', text:'#1a5c2e' },
    'checklist':                       { bg:'#dff2e3', border:'#6ab97d', text:'#1a5c2e' },
    'post-lift':                       { bg:'#dff2e3', border:'#6ab97d', text:'#1a5c2e' },
    'index':                           { bg:'#ddeaf7', border:'#5b9fd4', text:'#14437a' },
    'battery drain':                   { bg:'#fef0cc', border:'#e8a820', text:'#7a4d00' },
    'fuses':                           { bg:'#fef0cc', border:'#e8a820', text:'#7a4d00' },
    'fuses / pdc':                     { bg:'#fef0cc', border:'#e8a820', text:'#7a4d00' },
    'fuses / renix':                   { bg:'#feefca', border:'#e7a91c', text:'#7a4f00' },
    'headlights':                      { bg:'#fef2d0', border:'#eaad24', text:'#7c5200' },
    'grounds':                         { bg:'#f0e4d8', border:'#c09070', text:'#5c3010' },
    'cps':                             { bg:'#ddeaf7', border:'#5b9fd4', text:'#14437a' },
    'radiator':                        { bg:'#ddeaf7', border:'#5b9fd4', text:'#14437a' },
    'coolant filter':                  { bg:'#dae8f7', border:'#579cd2', text:'#123f76' },
    'fan / airflow':                   { bg:'#ddeaf7', border:'#5b9fd4', text:'#14437a' },
    'air in system':                   { bg:'#dae8f7', border:'#579cd2', text:'#123f76' },
    'a/c load':                        { bg:'#dae8f7', border:'#579cd2', text:'#123f76' },
    'blower / hvac':                   { bg:'#ddeaf7', border:'#5b9fd4', text:'#14437a' },
    'renix / cooling':                 { bg:'#ece3fa', border:'#9b72db', text:'#421d87' },
    'map / vacuum':                    { bg:'#ece3fa', border:'#9b72db', text:'#421d87' },
    'vacuum / exhaust':                { bg:'#eae0fa', border:'#9970d8', text:'#421d84' },
    'vacuum disconnect':               { bg:'#d6f0ed', border:'#3db8aa', text:'#0c4f46' },
    '4h / 4l':                         { bg:'#d6f0ed', border:'#3db8aa', text:'#0c4f46' },
    'alignment':                       { bg:'#e4eaef', border:'#8da8bb', text:'#2c4558' },
    'death wobble':                    { bg:'#fde0e4', border:'#e0717f', text:'#7d1025' },
    'steering stabilizer':             { bg:'#d4eeeb', border:'#3ab4a6', text:'#0a4b42' },
    'chain / linkage':                 { bg:'#f0e4d8', border:'#c09070', text:'#5c3010' },
    'linkage':                         { bg:'#f0e4d8', border:'#c09070', text:'#5c3010' },
    'shift lever':                     { bg:'#f0e4d8', border:'#c09070', text:'#5c3010' },
    'transfer case id':                { bg:'#d6f0ed', border:'#3db8aa', text:'#0c4f46' },
    'tps / renix':                     { bg:'#ece3fa', border:'#9b72db', text:'#421d87' },
    'throttle / renix':                { bg:'#ece3fa', border:'#9b72db', text:'#421d87' },

    /* ── MISC ── */
    'your category':                   { bg:'#eceef0', border:'#aab4be', text:'#3a4e5c' },
    'your specialty':                  { bg:'#eceef0', border:'#aab4be', text:'#3a4e5c' },
  };

  /* ─── Hash fallback for unknown tags ─────────────────────────── */
  function hash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function fallbackTone(label) {
    var hv = hash(label || 'default') % 360;
    return {
      bg:     'hsl(' + hv + ', 60%, 90%)',
      border: 'hsl(' + hv + ', 40%, 68%)',
      text:   'hsl(' + hv + ', 50%, 26%)'
    };
  }

  /* ─── Normalize label text (strip HTML entities, lowercase) ──── */
  var entityMap = { '&amp;':'&', '&lt;':'<', '&gt;':'>', '&quot;':'"', '&#39;':"'" };
  function decodeEntities(str) {
    return str.replace(/&[a-z]+;|&#\d+;/g, function(e) { return entityMap[e] || e; });
  }

  /* ─── Apply color to one element ─────────────────────────────── */
  function colorize(el) {
    var raw = (el.getAttribute('data-color-key') || el.textContent || '').trim();
    if (!raw) return;
    var key = decodeEntities(raw).toLowerCase();
    var t = PALETTE[key] || fallbackTone(key);
    el.style.background   = t.bg;
    el.style.borderColor  = t.border;
    el.style.color        = t.text;
  }

  /* ─── Run on all tag elements ─────────────────────────────────── */
  function run() {
    var selectors = [
      '.lcat',
      '.guide-tag',
      '.card-tag',
      '.parts-tag',
      '.featured-biz-tag',
      '.biz-type',
      '.featured-biz-type',
      '.post-type',
      '.card-cat'
    ];
    document.querySelectorAll(selectors.join(',')).forEach(colorize);
  }

  /* Also expose for pages that render cards dynamically (Supabase) */
  window.applyTagColors = run;

  var rerunTimer = null;
  function scheduleRun() {
    if (rerunTimer) return;
    rerunTimer = setTimeout(function() {
      rerunTimer = null;
      run();
    }, 60);
  }

  if (typeof MutationObserver !== 'undefined') {
    var mo = new MutationObserver(scheduleRun);
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
