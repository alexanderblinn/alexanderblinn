"""Build the journal from Markdown into dist/. Python 3.11+."""
from __future__ import annotations

import datetime as dt
from email.utils import format_datetime
from html import escape
import json
from pathlib import Path
import re
import shutil
from string import Template
import sys
import xml.etree.ElementTree as ET

import markdown
from markdown.extensions import Extension
from markdown.preprocessors import Preprocessor
from latex2mathml.converter import convert
import yaml

ROOT = Path(__file__).resolve().parent.parent
SECTIONS = {
    "projects": ("Projects", "Optimierung, Regelung, Programmierung und Datenanalyse."),
    "notes": ("Notes", "Kurze Erklärungen und Arbeitsnotizen."),
}


class MathPreprocessor(Preprocessor):
    def run(self, lines):
        result, formula = [], None
        fence = None
        for line in lines:
            marker = re.match(r"^\s{0,3}(`{3,}|~{3,})", line)
            if marker and formula is None:
                token = marker[1]
                if fence is None:
                    fence = token
                elif token[0] == fence[0] and len(token) >= len(fence) and not line[marker.end():].strip():
                    fence = None
                result.append(line)
            elif fence:
                result.append(line)
            elif re.fullmatch(r" {0,3}\$\$\s*", line):
                if formula is None:
                    formula = []
                else:
                    html = '<div class="math-block">' + convert("\n".join(formula), display="block") + '</div>'
                    result.extend(["", self.md.htmlStash.store(html), ""])
                    formula = None
            elif formula is not None:
                formula.append(line)
            else:
                result.append(line)
        if formula is not None:
            raise ValueError("Nicht abgeschlossener $$-Formelblock")
        return result


class MathExtension(Extension):
    def extendMarkdown(self, md):
        md.preprocessors.register(MathPreprocessor(md), "journal_math", 27)


# A fenced code block tagged ```lang tab="Label" joins any immediately following
# (blank lines aside) tab-tagged fences into one switchable group, e.g. a Python
# and a MATLAB version of the same algorithm. Plain fenced code is untouched.
TAB_FENCE = re.compile(r'^```(\S+)\s+tab="([^"]+)"\s*$')


class CodeTabsPreprocessor(Preprocessor):
    def run(self, lines):
        result, i, group = [], 0, 0
        while i < len(lines):
            match = TAB_FENCE.match(lines[i])
            if not match:
                result.append(lines[i])
                i += 1
                continue
            tabs = []
            while match:
                language, label = match.groups()
                i += 1
                start = i
                while i < len(lines) and lines[i].rstrip() != "```":
                    i += 1
                if i >= len(lines):
                    raise ValueError("Nicht abgeschlossener Tab-Codeblock")
                tabs.append((language, label, "\n".join(lines[start:i])))
                i += 1
                lookahead = i
                while lookahead < len(lines) and not lines[lookahead].strip():
                    lookahead += 1
                match = TAB_FENCE.match(lines[lookahead]) if lookahead < len(lines) else None
                if match:
                    i = lookahead
            if len(tabs) < 2:
                raise ValueError('Eine Code-Tab-Gruppe braucht mindestens zwei ```lang tab="..."-Blöcke')
            group += 1
            html = self.render(tabs, group)
            result.extend(["", self.md.htmlStash.store(html), ""])
        return result

    @staticmethod
    def render(tabs, group):
        name = f"code-tabs-{group}"
        parts = []
        for index, (language, label, code) in enumerate(tabs):
            input_id = f"{name}-{index}"
            checked = " checked" if index == 0 else ""
            parts.append(
                f'<input type="radio" class="code-tab-input" name="{name}" id="{input_id}"{checked}>'
                f'<label class="code-tab-label" for="{input_id}">{escape(label)}</label>'
                f'<pre class="code-tab-panel"><code class="language-{escape(language)}">{escape(code)}</code></pre>'
            )
        return '<div class="code-tabs" role="group" aria-label="Programmiersprache wählen">' + "".join(parts) + "</div>"


class CodeTabsExtension(Extension):
    def extendMarkdown(self, md):
        md.preprocessors.register(CodeTabsPreprocessor(md), "code_tabs", 28)


def render_markdown(body):
    extensions = ["fenced_code", "tables", "toc", "md_in_html", MathExtension(), CodeTabsExtension()]
    return markdown.markdown(body, extensions=extensions, output_format="html")


def read_content(path, root=ROOT):
    raw = path.read_text(encoding="utf-8-sig")
    match = re.match(r"\A---\r?\n(.*?)\r?\n---(?:\r?\n|$)(.*)\Z", raw, re.S)
    if not match:
        raise ValueError(f"{path}: YAML-Kopf zwischen --- fehlt")
    data = yaml.safe_load(match[1])
    if not isinstance(data, dict) or not isinstance(data.get("title"), str) or not data["title"].strip():
        raise ValueError(f"{path}: title fehlt")
    if "draft" in data and not isinstance(data["draft"], bool):
        raise ValueError(f"{path}: draft muss true oder false sein")
    if data.get("draft", False):
        return None
    slug = path.stem
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        raise ValueError(f"{path}: Dateiname muss ein einfacher URL-Slug sein")
    section = path.parent.name if path.parent != root / "content" else "about"
    date = data.get("date")
    if date is not None:
        if isinstance(date, str):
            date = dt.date.fromisoformat(date)
        if not isinstance(date, dt.date) or isinstance(date, dt.datetime):
            raise ValueError(f"{path}: date muss YYYY-MM-DD sein")
    tags = data.get("tags", [])
    if not isinstance(tags, list) or not all(isinstance(tag, str) for tag in tags):
        raise ValueError(f"{path}: tags muss eine Liste von Texten sein")
    return {**data, "date": date, "tags": tags, "section": section, "slug": slug,
            "url": f"/{section}/{slug}.html" if section != "about" else "/about.html",
            "body": render_markdown(match[2]), "source": path}


def tags_html(tags):
    return '<div class="tags">' + ''.join(f'<span>{escape(tag)}</span>' for tag in tags) + '</div>' if tags else ''


def entries_html(entries, projects=False):
    rows = []
    for entry in entries:
        date = entry["date"]
        stamp = f'<time datetime="{date.isoformat()}">{date.strftime("%d.%m.%Y")}</time>' if date else ''
        undated = ' undated' if not date else ''
        kind = entry.get("kind", {"notes": "note", "projects": "project"}.get(entry["section"], "note"))
        kind = {"note": "Note", "project": "Project", "build": "Build"}.get(kind, kind)
        rows.append(f'''<li class="entry{undated}"><div class="entry-line">{stamp}
          <a class="entry-title" href="{entry['url']}">{escape(entry['title'])}</a>
          <span class="entry-kind">{escape(kind)}</span></div>
          <p class="entry-description">{escape(entry.get('description', ''))}</p>
          {tags_html(entry['tags']) if projects else ''}</li>''')
    classes = "entry-list project-list" if projects else "entry-list"
    return f'<ul class="{classes}">' + '\n'.join(rows) + '</ul>'


def build(root=ROOT):
    root = Path(root).resolve()
    config = json.loads((root / "site.json").read_text(encoding="utf-8"))
    template = Template((root / "templates/base.html").read_text(encoding="utf-8"))
    output = root / "dist"
    # Only this known generated directory is cleared; never accept an arbitrary target.
    if output.is_symlink() or output.resolve() != root / "dist":
        raise ValueError("dist muss innerhalb des Projektordners liegen")
    articles = []
    for section in SECTIONS:
        for path in sorted((root / "content" / section).glob("*.md")):
            item = read_content(path, root)
            if item:
                articles.append(item)
    about = read_content(root / "content/about.md", root)
    if about is None:
        raise ValueError("Die About-Seite darf kein Entwurf sein")
    articles.sort(key=lambda a: (a["date"] or dt.date.min, a["slug"]), reverse=True)
    # Rendering and metadata validation happen before touching an existing build.
    pages = {}

    def page(url, title, body, active="", description=None, extra_head="", wide=False):
        links = [("/", "Start", "start"), *[(f"/{key}/", value[0], key) for key, value in SECTIONS.items()], ("/about.html", "About", "about")]
        nav = ' '.join(f'<a href="{href}"' + (' aria-current="page"' if key == active else '') + f'>{label}</a>' for href, label, key in links)
        pages[url] = template.substitute(title=escape(f"{title} — {config['name']}" if title else config['name']),
            description=escape(description or config['description'], quote=True), canonical=escape(config['url'].rstrip('/') + url, quote=True),
            github=escape(config['github'], quote=True), navigation=nav, content=body, extra_head=extra_head,
            page_class='page-wide' if wide else '')

    dated = [a for a in articles if a['date']]
    featured = [a for a in articles if a.get('featured')]
    home = Template((root / 'templates/home.html').read_text(encoding='utf-8')).substitute(
        notes=entries_html([a for a in articles if a['section'] == 'notes'][:5]),
        projects=entries_html([a for a in articles if a['section'] == 'projects'][:5], projects=True),
        selected=entries_html(featured))
    page('/', '', home, 'start')
    for section, (title, description) in SECTIONS.items():
        selected = [a for a in articles if a['section'] == section]
        body = f'<p class="eyebrow">alexanderblinn.com / {section}</p><h1>{title}</h1><p class="section-intro">{description}</p>'
        body += entries_html(selected, projects=section != 'notes') if selected else '<p>Noch keine Einträge.</p>'
        page(f'/{section}/', title, body, section, description)
    for item in articles + [about]:
        section = item['section']
        section_title = SECTIONS[section][0] if section in SECTIONS else 'About'
        date = item['date']
        meta = f'<time datetime="{date.isoformat()}">{date.strftime("%d.%m.%Y")}</time>' if date else ''
        if item.get('status'):
            meta += (' · ' if meta else '') + escape(item['status'])
        body = f'<article><header class="article-header"><p class="eyebrow">{section_title}</p><h1>{escape(item["title"])}</h1>'
        body += (f'<p class="meta">{meta}</p>' if meta else '') + tags_html(item['tags']) + '</header>'
        body += '<div class="article-body">' + item['body'] + '</div></article>'
        if section in SECTIONS:
            body += f'<p class="backlink"><a href="/{section}/">← All {section_title}</a></p>'
        page(item['url'], item['title'], body, section, item.get('description'), wide=item.get('layout') == 'wide')
    page('/404.html', 'Seite nicht gefunden', '<p class="eyebrow">404 / Seite nicht gefunden</p><h1>Hier ist noch nichts.</h1><p>Vielleicht wurde der Beitrag verschoben. Über <a href="/">Start</a> oder <a href="/notes/">Notes</a> geht es weiter.</p>')

    # Keep old diagram bookmarks working without keeping copies in public/.
    # Redirects are output files, not articles or sitemap entries.
    redirects = {}
    for old, new in config.get('redirects', {}).items():
        if not all(isinstance(url, str) and re.fullmatch(r'/(?:[a-z0-9-]+/)*[a-z0-9-]+\.html', url)
                   for url in (old, new)):
            raise ValueError(f'Ungültige Weiterleitung: {old} -> {new}')
        if old in pages or (root / 'public' / old.lstrip('/')).exists():
            raise ValueError(f'Weiterleitung würde eine Seite überschreiben: {old}')
        if new not in pages and not (root / 'public' / new.lstrip('/')).is_file():
            raise ValueError(f'Ziel der Weiterleitung fehlt: {new}')
        href = escape(new, quote=True)
        canonical = escape(config['url'].rstrip('/') + new, quote=True)
        redirects[old] = f'''<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<title>Weiterleitung</title><link rel="canonical" href="{canonical}">
<script>location.replace({json.dumps(new)} + location.search + location.hash);</script>
<noscript><meta http-equiv="refresh" content="0; url={href}"></noscript>
</head><body><p><a href="{href}">Zur Abbildung</a></p></body></html>
'''

    if output.exists():
        shutil.rmtree(output)
    output.mkdir()
    for url, html in {**pages, **redirects}.items():
        target = output / (url.lstrip('/') + 'index.html' if url.endswith('/') else url.lstrip('/'))
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(html, encoding='utf-8')
    shutil.copytree(root / 'assets', output / 'assets')
    if (root / 'public').exists():
        shutil.copytree(root / 'public', output, dirs_exist_ok=True)
    if (root / 'CNAME').exists():
        shutil.copy2(root / 'CNAME', output / 'CNAME')
    (output / '.nojekyll').touch()
    origin = config['url'].rstrip('/')
    (output / 'robots.txt').write_text(f'User-agent: *\nAllow: /\nSitemap: {origin}/sitemap.xml\n', encoding='utf-8')
    sitemap = ET.Element('urlset', xmlns='http://www.sitemaps.org/schemas/sitemap/0.9')
    for url in pages:
        if url != '/404.html':
            ET.SubElement(ET.SubElement(sitemap, 'url'), 'loc').text = origin + url
    ET.ElementTree(sitemap).write(output / 'sitemap.xml', encoding='utf-8', xml_declaration=True)
    rss = ET.Element('rss', version='2.0')
    channel = ET.SubElement(rss, 'channel')
    for key, value in [('title', config['name'] + ' — Journal'), ('link', origin), ('description', config['description']), ('language', 'de')]:
        ET.SubElement(channel, key).text = value
    for item in dated:
        node = ET.SubElement(channel, 'item')
        published = format_datetime(dt.datetime.combine(item['date'], dt.time(12), tzinfo=dt.timezone.utc), usegmt=True)
        for key, value in [('title', item['title']), ('link', origin + item['url']), ('guid', origin + item['url']), ('description', item.get('description', '')), ('pubDate', published)]:
            ET.SubElement(node, key).text = value
    ET.ElementTree(rss).write(output / 'feed.xml', encoding='utf-8', xml_declaration=True)
    print(f'{len(pages)} Seiten gebaut -> {output}')
    return pages


if __name__ == '__main__':
    try:
        build()
    except (ValueError, OSError, yaml.YAMLError) as error:
        print(f'Build fehlgeschlagen: {error}', file=sys.stderr)
        sys.exit(1)
