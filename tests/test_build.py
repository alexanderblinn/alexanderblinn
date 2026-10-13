"""Regression checks for publication, Markdown rendering and generated links.

Run with: python -m unittest discover -s tests -v
Every build runs in an isolated temporary copy of the site's inputs.
"""
from html.parser import HTMLParser
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from urllib.parse import unquote, urljoin, urlsplit
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = set()
        self.math_count = 0
        self.code_depth = 0
        self.math_in_code = False
        self.code_text = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for attribute in ("href", "src"):
            if attribute in attrs:
                self.links.append(attrs[attribute])
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if tag == "code":
            self.code_depth += 1
        if tag == "math":
            self.math_count += 1
            self.math_in_code |= self.code_depth > 0

    def handle_endtag(self, tag):
        if tag == "code":
            self.code_depth -= 1

    def handle_data(self, data):
        if self.code_depth:
            self.code_text.append(data)


class BuildTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory(prefix="journal-build-test-")
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        for directory in ("scripts", "content", "templates", "assets", "public"):
            source = ROOT / directory
            if source.exists():
                shutil.copytree(source, self.root / directory,
                                ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))
        for filename in ("site.json", "CNAME"):
            source = ROOT / filename
            if source.exists():
                shutil.copy2(source, self.root / filename)
        self.dist = self.root / "dist"

    def build(self):
        result = subprocess.run(
            [sys.executable, str(self.root / "scripts/build.py")],
            cwd=self.root, capture_output=True, text=True, encoding="utf-8",
            timeout=30,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def contribution(self, section, slug, *, draft=False, body="Test content."):
        path = self.root / "content" / section / f"{slug}.md"
        path.write_text(
            f'---\ntitle: "{slug}"\ndate: 2026-10-12\n'
            f'description: "{slug}"\nfeatured: true\ndraft: {str(draft).lower()}\n'
            f'---\n\n{body}\n', encoding="utf-8",
        )
        return path

    def assert_not_published(self, marker):
        for path in [*self.dist.rglob("*.html"), self.dist / "feed.xml",
                     self.dist / "sitemap.xml"]:
            with self.subTest(file=str(path.relative_to(self.dist)), marker=marker):
                self.assertNotIn(marker, path.read_text(encoding="utf-8"))

    def test_drafts_do_not_leak_into_pages_feed_or_sitemap(self):
        for section in ("projects", "notes"):
            self.contribution(section, f"private-draft-{section}", draft=True)
        self.build()
        self.assert_not_published("private-draft-")
        self.assertFalse(list(self.dist.rglob("private-draft-*.html")))

    def test_unpublishing_and_deleting_remove_old_output(self):
        self.contribution("notes", "article-to-unpublish")
        deleted = self.contribution("projects", "article-to-delete")
        self.build()
        self.assertTrue((self.dist / "notes/article-to-unpublish.html").is_file())
        self.assertTrue((self.dist / "projects/article-to-delete.html").is_file())
        self.assertIn("article-to-unpublish", (self.dist / "feed.xml").read_text(encoding="utf-8"))
        self.assertIn("article-to-delete", (self.dist / "sitemap.xml").read_text(encoding="utf-8"))

        self.contribution("notes", "article-to-unpublish", draft=True)
        deleted.unlink()
        self.build()
        self.assertFalse((self.dist / "notes/article-to-unpublish.html").exists())
        self.assertFalse((self.dist / "projects/article-to-delete.html").exists())
        self.assert_not_published("article-to-unpublish")
        self.assert_not_published("article-to-delete")

    def test_math_renders_but_fenced_code_stays_literal(self):
        self.contribution("notes", "math-regression", body=r"""
$$
x_{k+1}=Ax_k+Bu_k
$$

```latex
$$
y_{k+1}=Cy_k
$$
```

~~~text
$$
z_{k+1}=Dz_k
$$
~~~
""")
        self.build()
        parser = PageParser()
        parser.feed((self.dist / "notes/math-regression.html").read_text(encoding="utf-8"))
        self.assertEqual(parser.math_count, 1)
        self.assertFalse(parser.math_in_code)
        code = "".join(parser.code_text)
        self.assertIn("$$\ny_{k+1}=Cy_k\n$$", code)
        self.assertIn("$$\nz_{k+1}=Dz_k\n$$", code)
        self.assertNotIn("<math", code)

    def test_fence_with_trailing_text_does_not_end_code_block(self):
        self.contribution("notes", "fence-regression", body="""
```text
```not-a-closing-fence
$$
x^2
$$
```
""")
        self.build()
        parser = PageParser()
        parser.feed((self.dist / "notes/fence-regression.html").read_text(encoding="utf-8"))
        self.assertEqual(parser.math_count, 0)
        self.assertIn("```not-a-closing-fence\n$$\nx^2\n$$", "".join(parser.code_text))

    def test_indented_code_preserves_formula_delimiters(self):
        self.contribution("notes", "indented-code-regression", body="""
    $$
    x^2
    $$
""")
        self.build()
        parser = PageParser()
        parser.feed((self.dist / "notes/indented-code-regression.html").read_text(encoding="utf-8"))
        self.assertEqual(parser.math_count, 0)
        self.assertIn("$$\nx^2\n$$", "".join(parser.code_text))

    def test_all_local_page_asset_and_feed_links_exist(self):
        self.build()
        origin = json.loads((self.root / "site.json").read_text(encoding="utf-8"))["url"]
        host = urlsplit(origin).netloc
        parsed_pages = {}
        links = []
        for path in self.dist.rglob("*.html"):
            parser = PageParser()
            parser.feed(path.read_text(encoding="utf-8"))
            parsed_pages[path] = parser
            current = origin.rstrip("/") + "/" + path.relative_to(self.dist).as_posix()
            links.extend((path, urljoin(current, link)) for link in parser.links)

        sitemap = ET.parse(self.dist / "sitemap.xml")
        links.extend((self.dist / "sitemap.xml", node.text)
                     for node in sitemap.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc"))
        feed = ET.parse(self.dist / "feed.xml")
        links.extend((self.dist / "feed.xml", node.text)
                     for node in feed.findall("./channel/item/link"))
        for source, link in links:
            url = urlsplit(link)
            if url.scheme not in ("http", "https") or url.netloc != host:
                continue
            target = self.dist / unquote(url.path).lstrip("/")
            if target.is_dir():
                target /= "index.html"
            with self.subTest(source=str(source.relative_to(self.dist)), link=link):
                self.assertTrue(target.is_file(), f"Missing local target: {target}")
                if url.fragment and target in parsed_pages:
                    self.assertIn(unquote(url.fragment), parsed_pages[target].ids)


if __name__ == "__main__":
    unittest.main()
