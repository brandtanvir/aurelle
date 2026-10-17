"""Builds deck-standalone.html: one file with CSS, font and images inlined,
for tools that take a single HTML file (Figma Make, html.to.design, email)."""
import base64, mimetypes, re, sys
from pathlib import Path

root = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
mimetypes.add_type('image/webp', '.webp'); mimetypes.add_type('font/ttf', '.ttf')

def data_uri(rel, base):
    p = (base / rel).resolve()
    mime = mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
    return f"data:{mime};base64,{base64.b64encode(p.read_bytes()).decode()}"

html = (root / 'deck.html').read_text()
css = (root / 'deck.css').read_text()
css = re.sub(r"url\('([^')]+)'\)", lambda m: f"url('{data_uri(m.group(1), root)}')", css)
html = html.replace('<link rel="stylesheet" href="deck.css" />', f'<style>\n{css}\n</style>')
html = re.sub(r'src="((?:img|assets|marketing)/[^"]+)"', lambda m: f'src="{data_uri(m.group(1), root)}"', html)
html = re.sub(r'url\(((?:img|assets|marketing)/[^)]+)\)', lambda m: f"url({data_uri(m.group(1), root)})", html)
(root / 'deck-standalone.html').write_text(html)
print(f"deck-standalone.html {len(html) / 1e6:.1f} MB")
