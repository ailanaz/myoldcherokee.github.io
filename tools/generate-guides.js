/**
 * tools/generate-guides.js
 * Generates one HTML file per guide in /guides/ from assets/data/guides.json.
 * Run from repo root: node tools/generate-guides.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '..');
const JSON_PATH = path.join(ROOT, 'assets', 'data', 'guides.json');
const OUT_DIR   = path.join(ROOT, 'guides');

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function linksHtml(links) {
  if (!links || !links.length) return '<li>No external links yet.</li>';
  return links.map(l =>
    `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`
  ).join('\n        ');
}

function buildPage(g) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(g.title)} | MyOldCherokee.com</title>
  <meta name="description" content="${esc(g.summary)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../styles.css" />
  <link rel="icon" href="../favicon.png" type="image/png" />
</head>
<body>

<div class="topbar">
  <div class="container topbar-inner">
    <span>#1 Independent buy and sell directory and resource hub for owners of older Cherokee models</span>
    <div class="topbar-links">
      <a href="../index.html">Home</a>
      <a href="../state-search.html">Map</a>
      <a href="../submit.html">Post</a>
      <a href="../contact.html">Contact</a>
      <a href="../about.html">About</a>
    </div>
  </div>
</div>

<header class="site-header">
  <div class="container header-inner">
    <a href="../index.html" class="brand">
      <img src="../logo.png" alt="MyOldCherokee.com logo" />
      <span class="brand-name">MyOldCherokee.com</span>
    </a>
    <nav class="site-nav">
      <a href="../buy-sell.html">Buy &amp; Sell</a>
      <a href="../directory.html">Directory</a>
      <a href="../guides.html" class="active">Guides</a>
      <a href="../community.html">Community</a>
    </nav>
  </div>
</header>

<section class="page-hero">
  <div class="container">
    <p style="font-size:0.82rem;opacity:0.75;margin-bottom:0.5rem;">
      <a href="../guides.html" style="color:#fff;">DIY Guides</a> &rsaquo; ${esc(g.category)}
    </p>
    <h1>${esc(g.title)}</h1>
    <p class="hero-sub">${esc(g.summary)}</p>
  </div>
</section>

<div class="container" style="padding-top:2.5rem;padding-bottom:4rem;">
  <div style="max-width:740px;margin:0 auto;">

    <div class="form-wrap" style="margin-bottom:2rem;padding:1rem 1.5rem;">
      <p style="margin:0;font-size:0.93rem;"><strong>When to use this guide:</strong> ${esc(g.whenToUse)}</p>
    </div>

    <h2>What is happening</h2>
    <p>Write a plain-English explanation of what this symptom usually means for an older Cherokee.</p>

    <h2>What you need</h2>
    <ul>
      <li>Basic hand tools</li>
      <li>Flashlight</li>
      <li>Optional: multimeter</li>
    </ul>

    <h2>Quick checks first</h2>
    <ol>
      <li>Quick check 1</li>
      <li>Quick check 2</li>
      <li>Quick check 3</li>
    </ol>

    <h2>Step-by-step fix</h2>
    <ol>
      <li>Step 1</li>
      <li>Step 2</li>
      <li>Step 3</li>
    </ol>

    <h2>If that did not fix it</h2>
    <ul>
      <li>Next likely cause 1</li>
      <li>Next likely cause 2</li>
    </ul>

    <h2>Further reading</h2>
    <ul>
        ${linksHtml(g.links)}
    </ul>

    <div style="margin-top:2.5rem;">
      <a href="../guides.html" class="btn btn-outline">&larr; Back to Guides</a>
    </div>

  </div>
</div>

<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand-block">
        <div style="font-family:'Oswald',sans-serif;font-size:1.3rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#fff;">MyOldCherokee.com</div>
        <p>An independent buy and sell directory for older Cherokee models, with repair shops, junk/salvage yard listings, DIY/troubleshooting Guides, and community resources.</p>
        <p class="footer-disclaimer">Listings and information are provided in good faith and believed accurate to the best of our knowledge. We do not verify or guarantee third-party listings, businesses, products, or services. Users are responsible for their own due diligence. MyOldCherokee.com is not affiliated with or endorsed by Jeep&reg; or Stellantis&reg;. Brand and model names are used for identification and compatibility purposes only. All trademarks are the property of their respective owners.</p>
        <a href="../contact.html" class="btn btn-outline btn-sm footer-contact-btn">Contact Us</a>
      </div>
      <div class="footer-col">
        <ul>
          <li><a href="../index.html">Home</a></li>
          <li><a href="../buy-sell.html">Buy &amp; Sell</a></li>
          <li><a href="../directory.html">Directory</a></li>
          <li><a href="../guides.html">Guides</a></li>
          <li><a href="../community.html">Community</a></li>
          <li><a href="../about.html">About</a></li>
        </ul>
        <div>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="../state-search.html">State Search</a></li>
            <li><a href="../submit.html">List with Us</a></li>
            <li><a href="../contact.html">Contact</a></li>
            <li><a href="../duediligence.html">Due Diligence</a></li>
            <li><a href="../faq.html">FAQ</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; <span id="yr"></span> MyOldCherokee.com. All rights reserved. | <a class="footer-disclaimer-link" href="../about.html">About</a> | <a class="footer-disclaimer-link" href="../contact.html">Contact</a> | <a class="footer-disclaimer-link" href="../duediligence.html">Due Diligence</a></p>
      <p>www.myoldcherokee.com</p>
    </div>
  </div>
</footer>

<script>document.getElementById('yr').textContent = new Date().getFullYear();</script>
</body>
</html>
`;
}

function run() {
  if (!fs.existsSync(JSON_PATH)) {
    console.error('Missing:', JSON_PATH);
    process.exit(1);
  }

  const guides = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  if (!Array.isArray(guides) || guides.length === 0) {
    console.error('guides.json is empty or not an array.');
    process.exit(1);
  }

  // Check for duplicate slugs
  const seen = new Set();
  guides.forEach(g => {
    if (seen.has(g.slug)) { console.error('Duplicate slug:', g.slug); process.exit(1); }
    seen.add(g.slug);
  });

  fs.mkdirSync(OUT_DIR, { recursive: true });

  guides.forEach(g => {
    const outPath = path.join(OUT_DIR, `${g.slug}.html`);
    fs.writeFileSync(outPath, buildPage(g), 'utf8');
  });

  console.log(`Generated ${guides.length} guide pages in /guides/`);
}

run();
