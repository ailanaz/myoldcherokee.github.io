#!/usr/bin/env python3
"""Add 6 fuse guide entries to guides.json and create their HTML pages."""

import json
import os

BASE = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(BASE, 'assets', 'data', 'guides.json')
GUIDES_DIR = os.path.join(BASE, 'guides')

# ── 6 new JSON entries ──────────────────────────────────────────────────────

NEW_ENTRIES = [
  {
    "title": "Fuse box basics for Jeep Cherokee XJ (1984–2001): locations, diagrams, and safe testing",
    "category": "Electrical",
    "slug": "fuse-box-basics-xj-1984-2001",
    "summary": "Where the fuse boxes are on 1984–2001 Cherokees, how to read diagrams, and how to test fuses safely.",
    "whenToUse": "Lights, radio, windows, blower, wipers, horn, or other electrical items stop working suddenly.",
    "overview": "If something electrical stops working suddenly, a fuse or relay is often the reason. The panels are easy to find once you know where to look, and testing a fuse the right way takes two minutes. Don't guess — test it, then replace it with the correct rating.",
    "links": [
      { "label": "CherokeeForum: Jeep Cherokee 1984–1996 Fuse Box Diagram", "url": "https://www.cherokeeforum.com/how-tos/a/jeep-cherokee-1984-1996-fuse-box-diagram-398207/" },
      { "label": "CherokeeForum: Jeep Cherokee 1997–2001 Fuse Box Diagram", "url": "https://www.cherokeeforum.com/how-tos/a/jeep-cherokee-1997-2001-fuse-box-diagram-398208/" },
      { "label": "Fuse-box.info: Jeep Cherokee XJ 1997–2001 fuses and relays", "url": "https://fuse-box.info/jeep/jeep-cherokee-xj-1997-2001-fuses-and-relays" }
    ],
    "videos": [
      { "label": "Jeep Cherokee XJ 1984–1996 fuse box diagrams (YouTube)", "url": "https://www.youtube.com/watch?v=h5fih-Uv_sk" },
      { "label": "Jeep Cherokee XJ 1984–1996 fuse box diagrams (alternate) (YouTube)", "url": "https://www.youtube.com/watch?v=9DQVpB0lnG0" }
    ]
  },
  {
    "title": "1997–2001 under-hood fuse box (PDC): how to read it and what relays do",
    "category": "Electrical",
    "slug": "xj-1997-2001-under-hood-fuse-box-pdc-basics",
    "summary": "Where the under-hood fuse and relay box is on 1997–2001 XJs and how to use it for quick troubleshooting.",
    "whenToUse": "No start, no fuel pump prime, electric fan issues, or random power loss on a 1997–2001 Cherokee XJ.",
    "overview": "1997–2001 Cherokees have an under-hood Power Distribution Center (PDC) in addition to the interior panel. If the Jeep won't start, the fuel pump won't prime, or the fans aren't behaving, check the PDC first. It holds fuses and relays for key systems, and most checks take less than five minutes.",
    "links": [
      { "label": "CherokeeForum: Jeep Cherokee 1997–2001 Fuse Box Diagram", "url": "https://www.cherokeeforum.com/how-tos/a/jeep-cherokee-1997-2001-fuse-box-diagram-398208/" },
      { "label": "Fuse-box.info: Jeep Cherokee XJ 1997–2001 fuses and relays", "url": "https://fuse-box.info/jeep/jeep-cherokee-xj-1997-2001-fuses-and-relays" },
      { "label": "NAXJA: Relay alternatives (swap cautions and relay info)", "url": "https://naxja.org/threads/relay-alternatives.944685/" }
    ],
    "videos": [
      { "label": "Jeep Cherokee fuse box and relay basics (YouTube)", "url": "https://www.youtube.com/watch?v=uBtKWpfQSZY" }
    ]
  },
  {
    "title": "How to test a fuse correctly (not just eyeballing it)",
    "category": "Electrical",
    "slug": "how-to-test-a-fuse-correctly",
    "summary": "A quick, beginner-safe way to confirm a fuse is good using a test light or multimeter.",
    "whenToUse": "Something electrical stops working and you want to confirm the fuse fast before replacing parts.",
    "overview": "A fuse can look perfectly fine and still be blown — a hairline break in the metal strip is easy to miss. Testing takes two minutes with a test light or multimeter and removes all doubt. You can also test most fuses without pulling them out.",
    "links": [
      { "label": "CherokeeForum: Jeep Cherokee 1984–1996 Fuse Box Diagram (includes fuse basics)", "url": "https://www.cherokeeforum.com/how-tos/a/jeep-cherokee-1984-1996-fuse-box-diagram-398207/" }
    ],
    "videos": [
      { "label": "Checking fuses without removing them (YouTube)", "url": "https://www.youtube.com/watch?v=OTUot80BZcg" },
      { "label": "How to test car fuses with a test light (YouTube)", "url": "https://www.youtube.com/watch?v=o_AWj2fcQS4" }
    ]
  },
  {
    "title": "Fuse keeps blowing: what it means and how to find the short safely",
    "category": "Electrical",
    "slug": "fuse-keeps-blowing-find-the-short-safely",
    "summary": "A safe troubleshooting method for a fuse that blows repeatedly, including the test-light method to isolate a short.",
    "whenToUse": "The same fuse blows again immediately or blows whenever you turn on a specific system.",
    "overview": "If a fuse blows right away after you replace it, stop putting in new fuses — you have a short or a component drawing too much current. The test-light substitution method lets you find the fault without burning through a stack of fuses. Work through the circuit one piece at a time until the problem shows itself.",
    "links": [
      { "label": "NAXJA: Fuse blows every time (short finding method discussion)", "url": "https://naxja.org/threads/fuse-blows-everytime.1019641/" },
      { "label": "NAXJA: 97 XJ fuse keeps blowing (example thread)", "url": "https://naxja.org/threads/97-xj-11-fuse-keeps-blowing.1128233/" },
      { "label": "CherokeeForum: Keeps blowing fuse 11 (example thread)", "url": "https://www.cherokeeforum.com/f2/keeps-blowing-fuse-11-help-203677/" }
    ],
    "videos": [
      { "label": "Find a shorted circuit (YouTube)", "url": "https://www.youtube.com/watch?v=Lfk-vmeK4G0" }
    ]
  },
  {
    "title": "1987–1990 Renix fuse panel: loose terminals, overheating connectors, and repair options",
    "category": "Electrical",
    "slug": "renix-fuse-panel-loose-terminals-repair-options",
    "summary": "How to spot loose terminals and heat damage on Renix-era fuse panels, plus practical repair options owners use.",
    "whenToUse": "1987–1990 Renix XJ with intermittent electrical issues, loose fuses, or visible heat damage at the fuse panel.",
    "overview": "Renix-era fuse panels age in a specific way — the terminal grip loosens, heat builds up, and intermittent electrical problems follow. The problems often come and go, which makes them harder to trace. Check the panel itself before you start chasing the wiring.",
    "links": [
      { "label": "NAXJA: Renix-era fuse box terminal replacement", "url": "https://naxja.org/threads/renix-era-fuse-box-terminal-replacement.1138721/" },
      { "label": "ComancheClub: Fuse block dissection (terminal and panel details)", "url": "https://comancheclub.com/topic/45231-fuse-block-dissection/" }
    ],
    "videos": [
      { "label": "Renix fuse panel support (YouTube)", "url": "https://www.youtube.com/watch?v=TFBNsVFchCM" }
    ]
  },
  {
    "title": "Fuse diagrams by year: 1984–1996 and 1997–2001 quick links",
    "category": "Electrical",
    "slug": "xj-fuse-diagrams-by-year-quick-links",
    "summary": "A quick page that sends you to the correct fuse diagram for your Cherokee XJ year range.",
    "whenToUse": "You need the fuse layout fast and want the right diagram without searching.",
    "overview": "Use this page to go straight to the correct fuse diagram for your year range. No searching — just pick your years and click.",
    "links": [
      { "label": "CherokeeForum: Jeep Cherokee 1984–1996 Fuse Box Diagram", "url": "https://www.cherokeeforum.com/how-tos/a/jeep-cherokee-1984-1996-fuse-box-diagram-398207/" },
      { "label": "CherokeeForum: Jeep Cherokee 1997–2001 Fuse Box Diagram", "url": "https://www.cherokeeforum.com/how-tos/a/jeep-cherokee-1997-2001-fuse-box-diagram-398208/" },
      { "label": "Fuse-box.info: Jeep Cherokee XJ 1997–2001 fuses and relays", "url": "https://fuse-box.info/jeep/jeep-cherokee-xj-1997-2001-fuses-and-relays" }
    ],
    "videos": [
      { "label": "Checking fuses using a test light (YouTube)", "url": "https://www.youtube.com/watch?v=ksrsXwwukFc" }
    ]
  }
]

# ── Shared page parts ───────────────────────────────────────────────────────

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

DISCLAIMER = '<p style="font-size:0.9rem;color:var(--text-mid);margin-top:0.75rem;">We try to keep our links up to date. If a link is broken, please <a href="../contact.html">let us know</a> so we can update it.</p>'

# ── Per-guide body content (Overview + steps) ───────────────────────────────

BODIES = {

"fuse-box-basics-xj-1984-2001": """
    <h2>Overview</h2>
    <p>If something electrical stops working suddenly, a fuse or relay is often the reason. The panels are easy to find once you know where to look, and testing a fuse the right way takes two minutes. Don't guess — test it, then replace it with the correct rating.</p>

    <h2>What you need</h2>
    <ul>
      <li>Fuse puller or small pliers</li>
      <li>Flashlight</li>
      <li>Spare fuses (same amperage)</li>
      <li>Optional: test light</li>
      <li>Optional: multimeter</li>
    </ul>

    <h2>Quick checks first</h2>
    <ol>
      <li>Check whether anything else in the same area also stopped working — this points you to the right fuse.</li>
      <li>Find the correct panel for your year. 1984–1996 is mainly interior. 1997–2001 has an interior panel plus an under-hood Power Distribution Center (PDC).</li>
      <li>Use the panel diagram to locate the fuse for the item that failed.</li>
      <li>Never install a larger fuse. Always replace with the same amperage rating.</li>
    </ol>

    <h2>Step-by-step</h2>
    <ol>
      <li>Turn the ignition off.</li>
      <li>Open the correct fuse panel for your year range.</li>
      <li>Use the panel diagram to find the right fuse.</li>
      <li>Pull the fuse and inspect it. A broken metal strip means it is blown.</li>
      <li>If it looks okay, test it with a test light or multimeter anyway — a fuse can look fine and still be bad.</li>
      <li>Replace with the exact same amperage.</li>
      <li>If the fuse blows again right away, stop. Use the <a href="fuse-keeps-blowing-find-the-short-safely.html">Fuse keeps blowing</a> guide — you have a short or a component drawing too much current.</li>
      <li>1997–2001 owners: also check the under-hood PDC for the same system.</li>
    </ol>

    <h2>If that did not fix it</h2>
    <ul>
      <li>Confirm you pulled the right fuse using the diagram for your exact year range.</li>
      <li>A relay may be bad — common with fans and other high-load circuits.</li>
      <li>A connector may be loose or heat damaged.</li>
      <li>The problem may be in the switch, motor, or wiring downstream from the fuse.</li>
    </ul>
""",

"xj-1997-2001-under-hood-fuse-box-pdc-basics": """
    <h2>Overview</h2>
    <p>1997–2001 Cherokees have an under-hood Power Distribution Center (PDC) in addition to the interior panel. If the Jeep won't start, the fuel pump won't prime, or the fans aren't behaving, check the PDC first. It holds fuses and relays for key systems, and most checks take less than five minutes.</p>

    <h2>What you need</h2>
    <ul>
      <li>Flashlight</li>
      <li>Spare fuses (same amperage)</li>
      <li>Small pliers or fuse puller</li>
      <li>Optional: test light</li>
      <li>Optional: multimeter</li>
    </ul>

    <h2>Quick checks first</h2>
    <ol>
      <li>Open the PDC and use the diagram on the lid — do not pull anything until you have identified the correct fuse or relay.</li>
      <li>Look for visible heat damage: melted plastic, darkened terminals, or a fuse that is not seated flat.</li>
      <li>If you want to swap a relay, only swap it if you are sure the replacement relay matches. Swapping non-identical relays can cause new problems.</li>
      <li>If a fuse blows again right away, stop and use the <a href="fuse-keeps-blowing-find-the-short-safely.html">Fuse keeps blowing</a> guide.</li>
    </ol>

    <h2>Step-by-step</h2>
    <ol>
      <li>Turn the key off.</li>
      <li>Open the hood and open the PDC.</li>
      <li>Use the lid diagram to locate the fuse or relay for the problem system.</li>
      <li>Pull the fuse and inspect it. Replace only with the same amperage rating.</li>
      <li>If the fuse looks fine, test it with a test light or multimeter.</li>
      <li>Relay swap: if you have two relays you know are identical, swap them and see if the problem moves. If you are not sure they match, do not swap.</li>
      <li>If you see broken retaining tabs or a relay that does not seat firmly, fix the seating issue before driving.</li>
    </ol>

    <h2>If that did not fix it</h2>
    <ul>
      <li>The problem may be downstream — a switch, a motor, or wiring between the PDC and the component.</li>
      <li>PDC terminals may be loose or heat damaged, especially on high-mileage trucks.</li>
      <li>If fuses keep blowing, use the <a href="fuse-keeps-blowing-find-the-short-safely.html">Fuse keeps blowing</a> guide next.</li>
    </ul>
""",

"how-to-test-a-fuse-correctly": """
    <h2>Overview</h2>
    <p>A fuse can look perfectly fine and still be blown — a hairline break in the metal strip is easy to miss. Testing takes two minutes with a test light or multimeter and removes all doubt. You can also test most fuses without pulling them out.</p>

    <h2>What you need</h2>
    <ul>
      <li>Test light (fastest method) or multimeter</li>
      <li>Flashlight</li>
      <li>Spare fuses of the correct amperage</li>
    </ul>

    <h2>Quick checks first</h2>
    <ol>
      <li>Confirm whether the circuit needs the key on or off to have power — this affects how you test.</li>
      <li>Use the correct fuse diagram for your year range before pulling anything.</li>
      <li>Never replace a fuse with a higher amperage rating.</li>
    </ol>

    <h2>Test light method (fastest — no pulling required)</h2>
    <ol>
      <li>Set the parking brake. Put the Jeep in Park.</li>
      <li>Turn the key to the position that powers the circuit (some fuses only have power with key on).</li>
      <li>Connect the test light clamp to a solid chassis ground.</li>
      <li>Touch the probe tip to the small test points on top of the fuse.</li>
      <li>Both sides light up: the fuse is good.</li>
      <li>Only one side lights up: the fuse is blown — power enters but does not exit.</li>
      <li>Neither side lights up: the circuit may not have power right now, or there is a feed problem upstream.</li>
    </ol>

    <h2>Multimeter method</h2>
    <ol>
      <li>Key off. Pull the fuse out.</li>
      <li>Set the meter to continuity or ohms.</li>
      <li>Touch the probes to the two metal blades of the fuse.</li>
      <li>Continuity (or near-zero ohms): fuse is good.</li>
      <li>No continuity: fuse is blown — replace it.</li>
    </ol>

    <h2>If that did not fix it</h2>
    <ul>
      <li>If the fuse is good, check the relay, switch, wiring, or the component itself.</li>
      <li>If the new fuse blows again, use the <a href="fuse-keeps-blowing-find-the-short-safely.html">Fuse keeps blowing</a> guide.</li>
    </ul>
""",

"fuse-keeps-blowing-find-the-short-safely": """
    <h2>Overview</h2>
    <p>If a fuse blows right away after you replace it, stop putting in new fuses — you have a short or a component drawing too much current. The test-light substitution method lets you find the fault without burning through a stack of fuses. Work through the circuit one piece at a time until the problem shows itself.</p>

    <h2>What you need</h2>
    <ul>
      <li>Correct replacement fuse (same amperage)</li>
      <li>Test light (strongly recommended)</li>
      <li>Flashlight</li>
      <li>Basic hand tools</li>
      <li>Optional: multimeter</li>
    </ul>

    <h2>Quick checks first</h2>
    <ol>
      <li>Do not install a larger fuse — it will not protect the circuit and can start a fire.</li>
      <li>Use the fuse diagram for your year to confirm exactly what that fuse powers.</li>
      <li>Look for obvious rub points, pinched wires, and any areas where wiring runs near hot or sharp metal.</li>
    </ol>

    <h2>Step-by-step (test light substitution method)</h2>
    <ol>
      <li>Remove the blown fuse.</li>
      <li>If you have a test light, carefully jump it across the fuse socket contacts (in place of the fuse). The bulb acts as a current limiter and lets you troubleshoot without burning more fuses.</li>
      <li>Turn on the switch or condition that normally causes the fuse to blow.</li>
      <li>If the fault is present, the test light will glow brightly.</li>
      <li>While the light is on, gently flex and move harness sections in common trouble spots — under carpet, near the firewall, behind the dash, anywhere the wiring bends or has been disturbed.</li>
      <li>If the light flickers or changes brightness when you move a harness section, you are near the fault.</li>
      <li>Unplug components on the circuit one at a time. If the test light goes out or dims significantly after unplugging something, that component or its wiring is likely the cause.</li>
      <li>Inspect connectors for heat marks, dark or pushed-back pins, and loose fit.</li>
      <li>Repair the damaged wire or replace the failed component.</li>
      <li>Install the correct fuse and test again.</li>
    </ol>

    <h2>If that did not fix it</h2>
    <ul>
      <li>The short may be hidden inside a harness, under carpet, or only triggers when the body flexes. These take more time to find.</li>
      <li>A factory service manual with a wiring diagram for your year is very helpful at this point — it shows every connection in the circuit path.</li>
    </ul>
""",

"renix-fuse-panel-loose-terminals-repair-options": """
    <h2>Overview</h2>
    <p>Renix-era fuse panels age in a specific way — the terminal grip loosens, heat builds up, and intermittent electrical problems follow. The problems often come and go, which makes them harder to trace. Check the panel itself before you start chasing the wiring.</p>

    <h2>What you need</h2>
    <ul>
      <li>Flashlight</li>
      <li>Contact cleaner</li>
      <li>Small nylon brush</li>
      <li>Optional: small pick or dental tool for inspection</li>
      <li>Optional: terminal tools if doing deeper repairs</li>
    </ul>

    <h2>Quick checks first</h2>
    <ol>
      <li>Look for melted plastic, discoloration, or a burnt smell near the fuse panel.</li>
      <li>Check whether any fuses feel loose or rock in their slots instead of sitting firmly.</li>
      <li>With the key off, gently wiggle the harness connectors behind the panel and watch for any changes.</li>
    </ol>

    <h2>Step-by-step</h2>
    <ol>
      <li>Disconnect the battery before doing any work behind or inside the fuse panel.</li>
      <li>Remove the panel cover and inspect the affected fuse slots for discoloration or heat marks.</li>
      <li>Clean visible corrosion with contact cleaner and a brush — do not use abrasives on the terminal metal.</li>
      <li>If a fuse slot is loose or visibly heat damaged, do not force anything back in. Plan a terminal repair or replacement approach — the threads and links below show what other XJ owners have done.</li>
      <li>Reassemble carefully, reconnect the battery, and test the circuit again.</li>
    </ol>

    <h2>If that did not fix it</h2>
    <ul>
      <li>The problem may be a short on that circuit, not the panel itself. Use the <a href="fuse-keeps-blowing-find-the-short-safely.html">Fuse keeps blowing</a> guide.</li>
      <li>Random intermittent issues on a Renix XJ may also be a ground or connector problem elsewhere. See the <a href="random-weird-electrical-behavior-start-with-grounds.html">Random electrical behavior</a> guide.</li>
    </ul>
""",

"xj-fuse-diagrams-by-year-quick-links": """
    <h2>Overview</h2>
    <p>Use this page to go straight to the correct fuse diagram for your Cherokee XJ year range. No searching — just pick your years and click.</p>

    <h2>Find your year range</h2>
    <ul>
      <li><strong>1984–1996 XJ:</strong> One interior fuse box. Use the 1984–1996 diagram link below.</li>
      <li><strong>1997–2001 XJ:</strong> Interior fuse box plus an under-hood Power Distribution Center (PDC). Use both diagram links below.</li>
    </ul>

    <h2>Quick steps</h2>
    <ol>
      <li>Find your year range above.</li>
      <li>Open the matching diagram link.</li>
      <li>Locate the fuse or relay for the system that stopped working.</li>
      <li>If you need help testing the fuse, see the <a href="how-to-test-a-fuse-correctly.html">How to test a fuse correctly</a> guide.</li>
      <li>If the fuse keeps blowing after you replace it, see the <a href="fuse-keeps-blowing-find-the-short-safely.html">Fuse keeps blowing</a> guide.</li>
    </ol>
""",

}

# ── Build a single HTML page ────────────────────────────────────────────────

def links_html(link_list):
    out = ''
    for lnk in link_list:
        import html as _html
        out += '        <li><a href="{}" target="_blank" rel="noopener">{}</a></li>\n'.format(
            _html.escape(lnk['url'], quote=True),
            _html.escape(lnk['label'])
        )
    return out

def videos_html(video_list):
    if not video_list:
        return ''
    import html as _html
    items = ''
    for v in video_list:
        items += '        <li><a href="{}" target="_blank" rel="noopener">{}</a></li>\n'.format(
            _html.escape(v['url'], quote=True),
            _html.escape(v['label'])
        )
    return '\n    <h2>Videos</h2>\n    <ul>\n{}    </ul>\n'.format(items)

def build_page(g):
    import html as _html
    title_esc = _html.escape(g['title'])
    summary_esc = _html.escape(g['summary'])
    when_esc = _html.escape(g['whenToUse'])
    cat = g.get('category', 'Electrical')
    slug = g['slug']

    body = BODIES.get(slug, '')
    vids = videos_html(g.get('videos', []))
    src_links = links_html(g.get('links', []))

    return '''\
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
      <a href="../guides.html" style="color:#fff;">DIY Guides</a> &rsaquo; Electrical
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
{body}
{videos}
    <h2>Source links</h2>
    <ul>
{src_links}    </ul>
    {disclaimer}

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
        topbar=TOPBAR,
        header=HEADER,
        footer=FOOTER,
        body=body,
        videos=vids,
        src_links=src_links,
        disclaimer=DISCLAIMER,
    )

# ── Main ────────────────────────────────────────────────────────────────────

def main():
    # 1. Load existing JSON
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        guides = json.load(f)

    existing_slugs = {g['slug'] for g in guides}

    # 2. Find insertion point: after last Electrical entry, before Suspension
    insert_at = None
    for i, g in enumerate(guides):
        if g['category'] == 'Electrical':
            insert_at = i + 1   # insert after this one

    if insert_at is None:
        insert_at = len(guides)

    added = 0
    for entry in reversed(NEW_ENTRIES):
        if entry['slug'] in existing_slugs:
            print('  skip (already exists):', entry['slug'])
            continue
        guides.insert(insert_at, entry)
        added += 1

    # 3. Save updated JSON
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(guides, f, indent=2, ensure_ascii=False)
    print('guides.json updated — {} entries added, {} total'.format(added, len(guides)))

    # 4. Write HTML files
    os.makedirs(GUIDES_DIR, exist_ok=True)
    for entry in NEW_ENTRIES:
        slug = entry['slug']
        out_path = os.path.join(GUIDES_DIR, slug + '.html')
        content = build_page(entry)
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print('  wrote:', slug + '.html')

    print('\nDone.')

if __name__ == '__main__':
    main()
