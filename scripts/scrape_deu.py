# /// script
# requires-python = ">=3.11"
# dependencies = ["beautifulsoup4", "lxml", "markdownify", "pillow", "requests"]
# ///
"""Scrape public content from deu.edu.tr into ./content.

Run: uv run scripts/scrape_deu.py [--news-pages N] [--ann-pages N]
"""

import argparse
import hashlib
import io
import json
import re
import time
import unicodedata
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from markdownify import markdownify
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "content"
WWW = "https://www.deu.edu.tr"
NEWS = "https://haber.deu.edu.tr"
STATS = "https://sayilarla.deu.edu.tr"
UA = {"User-Agent": "Mozilla/5.0 (deu-web-remake content scraper)"}
DELAY = 0.4
MAX_IMG = 1600

PAGES = [
    "tarihce", "misyonumuz", "vizyonumuz", "temel-degerlerimiz",
    "rektor", "rektor-yardimcilari", "genel-sekreter", "genel-sekreter-yardimcilari",
    "akademik-birimler", "idari-birimler", "arastirma-deu", "e-bulten",
    "yonetmelikler", "yonergeler", "esaslar", "uygulama-ve-arastirma-merkez-yonetmelikleri",
]

CHROME = [
    ".navigation-wrapper", "#page-footer", "[class*=slideout]", ".pps-popup",
    ".open-accessibility-widget-wrapper", ".col-md-4", "script", "style", "noscript",
    "#skip-link", ".breadcrumb", "form",
]

session = requests.Session()
session.headers.update(UA)

TR = str.maketrans("çğıöşüÇĞİÖŞÜâîû", "cgiosuCGIOSUaiu")


def slugify(s: str) -> str:
    s = unicodedata.normalize("NFC", unquote(s)).translate(TR).lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:80] or "item"


def get(url: str) -> requests.Response:
    time.sleep(DELAY)
    r = session.get(url, timeout=30)
    r.raise_for_status()
    return r


def soup(url: str) -> BeautifulSoup:
    return BeautifulSoup(get(url).content, "lxml")


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def write_json(path: Path, data) -> None:
    write(path, json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def download(url: str, dest_dir: Path) -> str | None:
    """Download an image once; return path relative to content/."""
    if not url or url.startswith("data:"):
        return None
    name = Path(urlparse(url).path).name
    stem, _, ext = name.rpartition(".")
    if ext.lower() not in ("jpg", "jpeg", "png", "gif", "webp", "svg"):
        return None
    h = hashlib.sha1(url.encode()).hexdigest()[:6]
    dest = dest_dir / f"{slugify(stem)}-{h}.{ext.lower()}"
    if not dest.exists():
        try:
            data = get(url).content
        except requests.RequestException as e:
            print("  ! image", url, e)
            return None
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(shrink(data, ext.lower()))
    return dest.relative_to(ROOT).as_posix()


def shrink(data: bytes, ext: str) -> bytes:
    """Downscale large raster images so the repo stays light."""
    if ext not in ("jpg", "jpeg", "png") or len(data) < 300_000:
        return data
    try:
        img = Image.open(io.BytesIO(data))
        img.thumbnail((MAX_IMG, MAX_IMG))
        out = io.BytesIO()
        if ext == "png":
            img.save(out, "PNG", optimize=True)
        else:
            img.convert("RGB").save(out, "JPEG", quality=80, optimize=True, progressive=True)
        return out.getvalue() if out.tell() < len(data) else data
    except OSError:
        return data


def frontmatter(meta: dict) -> str:
    lines = ["---"]
    for k, v in meta.items():
        if v is None or v == []:
            continue
        lines.append(f"{k}: {json.dumps(v, ensure_ascii=False)}")
    return "\n".join(lines) + "\n---\n\n"


def to_markdown(node, img_dir: Path, base: str) -> tuple[str, list[str]]:
    images = []
    for img in node.find_all("img"):
        src = img.get("data-src") or img.get("src")
        local = download(urljoin(base, src), img_dir) if src else None
        if local:
            images.append(local)
            img["src"] = "/" + local
        for attr in ("srcset", "sizes", "data-src", "width", "height"):
            img.attrs.pop(attr, None)
    for a in node.find_all("a", href=True):
        a["href"] = urljoin(base, a["href"])
    md = markdownify(str(node), heading_style="ATX", strip=["span", "div"])
    md = re.sub(r"\[/?su_[^\]]*\]", "", md)
    md = re.sub(r"\[(İçeriğe|Navigasyona) atla\]\([^)]*\)", "", md)
    md = re.sub(r"\[Engelsiz Dokuz Eylül Anasayfası[^\]]*\]\([^)]*\)", "", md)
    md = re.sub(r"&lt;span data-mce.*?&gt;|&lt;/span&gt;|\ufeff", "", md)
    md = re.sub(r"\n[ \t ]+\n", "\n\n", md)
    md = re.sub(r"\n{3,}", "\n\n", md).strip()
    return md, images


def tabs(node) -> list[dict]:
    """Shortcodes Ultimate tab groups -> [{title, links:[{text,url}]}]."""
    out = []
    for group in node.select(".su-tabs"):
        titles = [t.get_text(" ", strip=True) for t in group.select(".su-tabs-nav > span")]
        panes = group.select(".su-tabs-pane")
        for title, pane in zip(titles, panes):
            links = [
                {"text": a.get_text(" ", strip=True), "url": a["href"]}
                for a in pane.find_all("a", href=True)
                if a.get_text(strip=True)
            ]
            out.append({"title": title, "links": links, "text": pane.get_text(" ", strip=True)[:2000]})
    return out


def nav_tree(ul) -> list[dict]:
    items = []
    for li in ul.find_all("li", recursive=False):
        a = li.find("a")
        item = {"text": a.get_text(" ", strip=True), "url": a.get("href")}
        sub = li.find("ul")
        if sub:
            item["children"] = nav_tree(sub)
        items.append(item)
    return items


def scrape_home() -> None:
    print("home")
    s = soup(WWW + "/")
    site = {}
    site["navigation"] = nav_tree(s.select_one("#menu-anamenu"))
    top = s.select_one(".navigation-wrapper")
    site["topLinks"] = [
        {"text": a.get_text(" ", strip=True), "url": a["href"]}
        for a in (top.select(".secondary-navigation a, .top-bar a") if top else [])
        if a.get_text(strip=True)
    ]
    # mega-menu panels: academic units, research, administrative units
    panels = [tabs(so) for so in s.select("[class*=-slideout-content]")]
    for key, panel in zip(("academicUnits", "research", "administrativeUnits"), panels):
        site[key] = panel
    footer = s.select_one("#page-footer")
    site["footer"] = {
        "links": [
            {"text": a.get_text(" ", strip=True), "url": a["href"]}
            for a in footer.find_all("a", href=True) if a.get_text(strip=True)
        ],
        "text": footer.get_text("\n", strip=True),
    }
    socials = []
    for a in s.find_all("a", href=True):
        host = urlparse(a["href"]).netloc
        if any(x in host for x in ("facebook", "twitter", "x.com", "instagram", "youtube", "linkedin", "tiktok")):
            socials.append(a["href"])
    site["social"] = sorted(set(socials))
    slides = []
    for li in s.select(".amazingslider-slides li"):
        img = li.find("img")
        a = li.find("a")
        src = img.get("src") or img.get("data-src")
        slides.append({
            "image": download(src, ROOT / "images/slider"),
            "alt": img.get("alt"),
            "link": a["href"] if a else None,
        })
    site["slider"] = slides
    write_json(ROOT / "site.json", site)


def scrape_page(slug: str) -> dict | None:
    url = f"{WWW}/{slug}/"
    print("page", slug)
    try:
        s = soup(url)
    except requests.RequestException as e:
        print("  !", e)
        return None
    title = (s.find("title").get_text() if s.find("title") else slug).split("|")[0].strip()
    groups = tabs(s.find("body"))
    body = s.find("body")
    for sel in CHROME:
        for el in body.select(sel):
            el.decompose()
    main = body.select_one(".col-md-8") or body
    md, images = to_markdown(main, ROOT / "images/pages" / slug, url)
    write(ROOT / "pages" / f"{slug}.md", frontmatter({"title": title, "source": url, "images": images}) + md + "\n")
    return {"slug": slug, "title": title, "source": url, "tabs": groups or None}


def scrape_news(pages: int) -> None:
    index = []
    for p in range(1, pages + 1):
        print("news feed page", p)
        try:
            feed = BeautifulSoup(get(f"{NEWS}/feed/?paged={p}").content, "xml")
        except requests.RequestException as e:
            print("  !", e)
            break
        for item in feed.find_all("item"):
            link = item.link.get_text(strip=True)
            slug = slugify(urlparse(link).path.strip("/").split("/")[-1])
            date = parsedate_to_datetime(item.pubDate.get_text()).isoformat()
            cats = [c.get_text(strip=True) for c in item.find_all("category")]
            title = item.title.get_text(strip=True)
            html = item.find("content:encoded") or item.find("encoded")
            node = BeautifulSoup(html.get_text() if html else "", "lxml").body or BeautifulSoup("", "lxml")
            cover = None
            try:
                page = soup(link)
                og = page.select_one('meta[property="og:image"]')
                if og:
                    cover = download(og["content"], ROOT / "images/news")
            except requests.RequestException:
                pass
            md, images = to_markdown(node, ROOT / "images/news" / slug, link)
            excerpt = re.sub(r"\s+", " ", node.get_text(" ", strip=True))[:280]
            meta = {"title": title, "date": date, "categories": cats, "cover": cover, "source": link}
            write(ROOT / "news" / f"{slug}.md", frontmatter(meta) + md + "\n")
            index.append({**meta, "slug": slug, "excerpt": excerpt, "images": images})
    index.sort(key=lambda x: x["date"], reverse=True)
    write_json(ROOT / "news" / "index.json", index)


def scrape_announcements(pages: int) -> None:
    index, seen = [], set()
    for p in range(1, pages + 1):
        url = f"{WWW}/tum-duyurular/" + (f"page/{p}/" if p > 1 else "")
        print("announcements page", p)
        try:
            s = soup(url)
        except requests.RequestException as e:
            print("  !", e)
            break
        items = s.select("h3.news-title a")
        if not items:
            break
        for a in items:
            link = a["href"]
            if link in seen:  # sticky posts repeat on every page
                continue
            seen.add(link)
            host = urlparse(link).netloc.split(".")[0]
            slug = slugify(urlparse(link).path.strip("/").split("/")[-1])
            if host != "www":
                slug = f"{host}-{slug}"
            title = a.get_text(" ", strip=True)
            try:
                d = soup(link)
            except requests.RequestException as e:
                print("  !", link, e)
                continue
            date_el = d.select_one("time, .date, .post-date, .entry-date")
            date = date_el.get("datetime") or date_el.get_text(strip=True) if date_el else None
            if not date:
                m = d.select_one('meta[property="article:published_time"]')
                date = m["content"] if m else None
            dm = re.search(r"(\d{2})-(\d{2})-(\d{4})", date or "")
            if dm:
                date = f"{dm[3]}-{dm[2]}-{dm[1]}"
            body = d.find("body")
            for sel in CHROME:
                for el in body.select(sel):
                    el.decompose()
            main = body.select_one(".col-md-8") or body
            attachments = [
                urljoin(link, x["href"]) for x in main.find_all("a", href=True)
                if re.search(r"\.(pdf|docx?|xlsx?|pptx?|zip)$", x["href"], re.IGNORECASE)
            ]
            md, images = to_markdown(main, ROOT / "images/announcements" / slug, link)
            meta = {"title": title, "date": date, "source": link, "attachments": attachments}
            write(ROOT / "announcements" / f"{slug}.md", frontmatter(meta) + md + "\n")
            index.append({**meta, "slug": slug, "images": images})
    index.sort(key=lambda x: x["date"] or "", reverse=True)
    write_json(ROOT / "announcements" / "index.json", index)


def parse_table(table) -> dict | None:
    head = table.select_one("thead tr")
    if not head:
        return None
    cols = [th.get_text(" ", strip=True) for th in head.find_all(["th", "td"])]
    rows = []
    for tr in table.select("tbody tr"):
        cells = [td.get_text(" ", strip=True) for td in tr.find_all("td")]
        if any(cells):
            rows.append(cells)
    drop = [i for i, c in enumerate(cols) if c.lower().startswith("wdt")]
    keep = lambda r: [v for i, v in enumerate(r) if i not in drop]
    return {"columns": keep(cols), "rows": [keep(r) for r in rows]}


def scrape_stats() -> None:
    """Sayılarla DEÜ: headline numbers + yearly tables."""
    home = soup(STATS + "/")
    links = sorted({
        a["href"] for a in home.find_all("a", href=True)
        if a["href"].startswith(STATS + "/") and "feed" not in a["href"] and a["href"].rstrip("/") != STATS
    })
    out = []
    for url in [STATS + "/", *links]:
        print("stats", url)
        s = home if url == STATS + "/" else soup(url)
        for t in s.select("script, style, noscript, header, footer, nav"):
            t.decompose()
        title = [t.strip() for t in (s.find("title").get_text() if s.find("title") else url).split("|") if t.strip()][-1]
        headline = []
        for h in s.find_all("h3"):
            num = h.get_text(strip=True)
            label = h.find_next("h4")
            if re.fullmatch(r"[\d.,]+", num) and label:
                headline.append({"label": label.get_text(" ", strip=True), "value": int(re.sub(r"\D", "", num))})
        tables = []
        for tb in s.find_all("table"):
            heading = tb.find_previous(["h1", "h2", "h3", "h4"])
            parsed = parse_table(tb)
            if parsed and parsed["rows"]:
                tables.append({"title": heading.get_text(" ", strip=True) if heading else None, **parsed})
        slug = slugify(urlparse(url).path.strip("/")) if url != STATS + "/" else "index"
        md, _ = to_markdown(s.body, ROOT / "images/stats", url)
        md = md[md.find("\n#") + 1:] if "\n#" in md else md
        write(ROOT / "stats" / f"{slug}.md", frontmatter({"title": title, "source": url}) + md + "\n")
        out.append({"slug": slug, "title": title, "source": url, "headline": headline or None, "tables": tables})
    write_json(ROOT / "stats" / "index.json", out)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--news-pages", type=int, default=6)
    ap.add_argument("--ann-pages", type=int, default=3)
    ap.add_argument("--only", choices=["home", "pages", "news", "announcements", "stats"])
    args = ap.parse_args()
    if args.only in (None, "home"):
        scrape_home()
    if args.only in (None, "pages"):
        pages = [p for p in (scrape_page(s) for s in PAGES) if p]
        write_json(ROOT / "pages" / "index.json", pages)
    if args.only in (None, "news"):
        scrape_news(args.news_pages)
    if args.only in (None, "announcements"):
        scrape_announcements(args.ann_pages)
    if args.only in (None, "stats"):
        scrape_stats()


if __name__ == "__main__":
    main()
