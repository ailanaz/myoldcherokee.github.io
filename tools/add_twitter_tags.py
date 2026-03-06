#!/usr/bin/env python3
"""
add_twitter_tags.py
Adds Twitter/X Card meta tags to all HTML files that have OG tags but no twitter:card tag.
Extracts og:title, og:description, og:image from each file and mirrors them as twitter: tags.
"""

import os
import re

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def extract_og(content, prop):
    """Extract content from an og: meta tag."""
    match = re.search(
        r'<meta\s+property=["\']og:' + prop + r'["\']\s+content=["\'](.*?)["\']',
        content, re.IGNORECASE
    )
    return match.group(1) if match else None

def has_twitter(content):
    return 'twitter:card' in content

def add_twitter_tags(content, title, description, image):
    """Insert twitter: tags after the last og: meta tag."""
    twitter_block = (
        f'  <meta name="twitter:card" content="summary_large_image" />\n'
        f'  <meta name="twitter:title" content="{title}" />\n'
        f'  <meta name="twitter:description" content="{description}" />\n'
        f'  <meta name="twitter:image" content="{image}" />\n'
    )
    # Insert after the last <meta property="og:..."> line
    last_og = list(re.finditer(r'  <meta property="og:[^"]*"[^\n]*\n', content))
    if not last_og:
        return content  # can't find insertion point, skip
    insert_pos = last_og[-1].end()
    return content[:insert_pos] + twitter_block + content[insert_pos:]

updated = []
skipped = []
errors = []

for root, dirs, files in os.walk(REPO):
    # Skip hidden dirs and tools dir
    dirs[:] = [d for d in dirs if not d.startswith('.')]
    for fname in files:
        if not fname.endswith('.html'):
            continue
        fpath = os.path.join(root, fname)
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                content = f.read()

            if has_twitter(content):
                skipped.append(fpath)
                continue

            title = extract_og(content, 'title')
            description = extract_og(content, 'description')
            image = extract_og(content, 'image')

            if not title or not description or not image:
                skipped.append(f'{fpath} (missing og tags)')
                continue

            new_content = add_twitter_tags(content, title, description, image)
            if new_content == content:
                skipped.append(f'{fpath} (insertion point not found)')
                continue

            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            updated.append(fpath.replace(REPO + '/', ''))

        except Exception as e:
            errors.append(f'{fpath}: {e}')

print(f"✅ Updated: {len(updated)} files")
for f in updated:
    print(f"   + {f}")
print(f"\n⏭  Skipped: {len(skipped)} files")
if errors:
    print(f"\n❌ Errors: {len(errors)}")
    for e in errors:
        print(f"   ! {e}")
