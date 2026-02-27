#!/usr/bin/env python3
"""Regenerate all guide pages from guides.json data."""

import json
import os
import html

BASE = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(BASE, 'assets', 'data', 'guides.json')
GUIDES_DIR = os.path.join(BASE, 'guides')

TOPBAR = '''\
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
</div>'''

HEADER = '''\
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
</header>'''

FOOTER = '''\
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
</footer>'''

# Category breadcrumb label map
CAT_LABEL = {
    'No Start': 'No Start',
    'Overheating': 'Overheating',
    'Electrical': 'Electrical',
    'Suspension and Steering': 'Suspension &amp; Steering',
    'Engine and Idle': 'Engine &amp; Idle',
    '4WD and Transfer Case': '4WD',
}


def build_page(g):
    title_esc = html.escape(g['title'])
    summary_esc = html.escape(g['summary'])
    when_esc = html.escape(g['whenToUse'])
    overview_esc = html.escape(g.get('overview', ''))
    cat = g.get('category', '')
    cat_label = CAT_LABEL.get(cat, html.escape(cat))

    # Source links
    links_html = ''
    for lnk in g.get('links', []):
        links_html += '        <li><a href="{url}" target="_blank" rel="noopener">{label}</a></li>\n'.format(
            url=html.escape(lnk['url'], quote=True),
            label=html.escape(lnk['label'])
        )

    # Videos section (only rendered if videos exist)
    videos = g.get('videos', [])
    videos_section = ''
    if videos:
        vid_items = ''
        for v in videos:
            vid_items += '        <li><a href="{url}" target="_blank" rel="noopener">{label}</a></li>\n'.format(
                url=html.escape(v['url'], quote=True),
                label=html.escape(v['label'])
            )
        videos_section = '''
    <h2>Videos</h2>
    <ul>
{items}    </ul>
'''.format(items=vid_items)

    page = '''\
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} | MyOldCherokee.com</title>
  <meta name="description" content="{summary}" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../styles.css" />
  <link rel="icon" href="../favicon.png" type="image/png" />
</head>
<body>

{topbar}

{header}

<section class="page-hero">
  <div class="container">
    <p style="font-size:0.82rem;opacity:0.75;margin-bottom:0.5rem;">
      <a href="../guides.html" style="color:#fff;">DIY Guides</a> &rsaquo; {cat_label}
    </p>
    <h1>{title}</h1>
    <p class="hero-sub">{summary}</p>
  </div>
</section>

<div class="container" style="padding-top:2.5rem;padding-bottom:4rem;">
  <div style="max-width:740px;margin:0 auto;">

    <div class="form-wrap" style="margin-bottom:2rem;padding:1rem 1.5rem;">
      <p style="margin:0;font-size:0.93rem;"><strong>When to use this guide:</strong> {when}</p>
    </div>

    <h2>Overview</h2>
    <p>{overview}</p>

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

    <h2>Step-by-step</h2>
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
{videos_section}
    <h2>Source links</h2>
    <ul>
{links}    </ul>
    <p style="font-size:0.9rem;color:var(--text-mid);margin-top:0.75rem;">We try to keep our links up to date. If a link is broken, please <a href="../contact.html">let us know</a> so we can update it.</p>

    <div style="margin-top:2.5rem;">
      <a href="../guides.html" class="btn btn-outline">&larr; Back to Guides</a>
    </div>

  </div>
</div>

{footer}

<script>document.getElementById('yr').textContent = new Date().getFullYear();</script>
</body>
</html>
'''.format(
        title=title_esc,
        summary=summary_esc,
        when=when_esc,
        overview=overview_esc,
        cat_label=cat_label,
        topbar=TOPBAR,
        header=HEADER,
        footer=FOOTER,
        links=links_html,
        videos_section=videos_section,
    )
    return page


def main():
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        guides = json.load(f)

    os.makedirs(GUIDES_DIR, exist_ok=True)
    count = 0
    for g in guides:
        slug = g['slug']
        out_path = os.path.join(GUIDES_DIR, slug + '.html')
        content = build_page(g)
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
        print('  wrote:', slug + '.html')

    print('\nDone. {} guide pages written.'.format(count))


if __name__ == '__main__':
    main()
