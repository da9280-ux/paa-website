"""Assemble the static site: shared header, newsletter and footer are injected into each page.
Run:  python build.py        -> writes dist/*.html (what GitHub Pages serves)
"""
import pathlib, re

ROOT = pathlib.Path(__file__).parent
SRC, DIST = ROOT / "src", ROOT / "dist"

HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{head}
</head>
<body data-page="{page}">
{body}
</body>
</html>
"""

HEAD_TAGS = """<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,600;1,8..60,600&display=swap">
<link rel="stylesheet" href="assets/site.css">
<script src="assets/site.js" defer></script>"""


def build():
    partials = {p.stem: p.read_text() for p in (SRC / "partials").glob("*.html")}
    for page in sorted((SRC / "pages").glob("*.html")):
        text = page.read_text()
        meta, body = text.split("---\n", 2)[1:]
        fields = dict(line.split(": ", 1) for line in meta.strip().splitlines())
        body = re.sub(r"\{\{(\w+)\}\}", lambda m: partials[m.group(1)], body)
        head = HEAD_TAGS.format(title=fields["title"], desc=fields["description"])
        (DIST / page.name).write_text(HEAD.format(head=head, page=fields["page"], body=body.strip()))
        print("built", page.name)


if __name__ == "__main__":
    build()
