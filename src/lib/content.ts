// Reads the scraped archive in /content. Synchronous I/O is prerendered
// at build time under Cache Components, so these helpers stay sync.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { media, type Media, unitLogo } from "./media";
import { slugify, smartTitle } from "./text";

const ROOT = path.join(process.cwd(), "content");

type Frontmatter = Record<string, unknown>;

function parse(file: string): { meta: Frontmatter; body: string } {
  const raw = readFileSync(file, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, body: raw };
  const meta: Frontmatter = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    try {
      meta[line.slice(0, i).trim()] = JSON.parse(line.slice(i + 1).trim());
    } catch {
      meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return { meta, body: raw.slice(m[0].length).trim() };
}

function headingOf(file: string): string {
  const { meta, body } = parse(file);
  const h = body.match(/^#+\s+(.+)$/m)?.[1]?.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").trim();
  return h || String(meta.title ?? "");
}

const json = <T>(rel: string): T => JSON.parse(readFileSync(path.join(ROOT, rel), "utf8"));

/* ------------------------------------------------------------------ news */

export type NewsItem = {
  slug: string;
  title: string;
  date: string;
  categories: string[];
  cover: Media | null;
  /** largest landscape photo for full-bleed use */
  lead: Media | null;
  excerpt: string;
  source: string;
  gallery: Media[];
};

type RawNews = {
  slug: string;
  title: string;
  date: string;
  categories: string[];
  cover: string | null;
  excerpt: string;
  source: string;
  images: string[];
};

function toNews(n: RawNews): NewsItem {
  const title = smartTitle(n.title);
  const all = [...new Set(n.images)].map((p) => media(p, title)).filter((m): m is Media => !!m);
  // inline galleries are mostly 357px thumbnails; keep only usable sizes
  const gallery = all.filter((m) => m.width >= 900);
  const lead = [...gallery].sort((x, y) => y.width - x.width)[0] ?? null;
  return {
    slug: n.slug,
    title,
    date: n.date,
    categories: n.categories.filter((c) => c !== "Genel"),
    cover: media(n.cover, title) ?? lead,
    lead: lead ?? media(n.cover, title),
    excerpt: n.excerpt,
    source: n.source,
    gallery,
  };
}

export function getNews(): NewsItem[] {
  return json<RawNews[]>("news/index.json").map(toNews);
}

export function getNewsArticle(slug: string) {
  const item = getNews().find((n) => n.slug === slug);
  if (!item) return null;
  const { body } = parse(path.join(ROOT, "news", `${slug}.md`));
  return { ...item, body };
}

/* --------------------------------------------------------- announcements */

export type Announcement = {
  slug: string;
  title: string;
  date: string | null;
  source: string;
  attachments: string[];
  image: Media | null;
};

type RawAnnouncement = {
  slug: string;
  title: string;
  date: string | null;
  source: string;
  attachments?: string[];
  images: string[];
};

export function getAnnouncements(): Announcement[] {
  return json<RawAnnouncement[]>("announcements/index.json").map((a) => ({
    slug: a.slug,
    title: smartTitle(a.title || headingOf(path.join(ROOT, "announcements", `${a.slug}.md`))),
    date: a.date,
    source: a.source,
    attachments: a.attachments ?? [],
    image: media(a.images[0], a.title),
  }));
}

export function getAnnouncement(slug: string) {
  const item = getAnnouncements().find((a) => a.slug === slug);
  if (!item) return null;
  let { body } = parse(path.join(ROOT, "announcements", `${slug}.md`));
  // drop the duplicated title + date header the source page carries
  body = body.replace(/^##[^\n]*\n+/, "").replace(/^Yayınlanma Tarihi:[^\n]*\n+(---\n+)?/, "");
  return { ...item, body };
}

/* ----------------------------------------------------------------- pages */

export function getPage(slug: string) {
  const { meta, body } = parse(path.join(ROOT, "pages", `${slug}.md`));
  return {
    title: String(meta.title ?? slug),
    source: String(meta.source ?? ""),
    images: ((meta.images as string[]) ?? []).map((p) => media(p)).filter((m): m is Media => !!m),
    body,
  };
}

/* ------------------------------------------------------------------ site */

type Link = { text: string; url: string };
export type Tab = { title: string; links: Link[]; text: string };

type Site = {
  navigation: (Link & { children?: (Link & { children?: Link[] })[] })[];
  topLinks: Link[];
  academicUnits: Tab[];
  research: Tab[];
  administrativeUnits: Tab[];
  footer: { links: Link[]; text: string };
  social: string[];
};

export function getSite(): Site {
  return json<Site>("site.json");
}

export type Unit = {
  name: string;
  slug: string;
  url: string;
  logo: string | null;
  group: UnitGroup;
};

export type UnitGroup = "Fakülteler" | "Enstitüler" | "Yüksekokullar" | "Meslek Yüksekokulları";
export const UNIT_GROUPS: UnitGroup[] = ["Fakülteler", "Enstitüler", "Yüksekokullar", "Meslek Yüksekokulları"];

export function getUnits(): Unit[] {
  const site = getSite();
  return site.academicUnits
    .filter((t): t is Tab & { title: UnitGroup } => UNIT_GROUPS.includes(t.title as UnitGroup))
    .flatMap((t) =>
      t.links
        .filter((l) => !/Bilgi Sistemi/.test(l.text))
        .map((l) => {
          const slug = slugify(l.text);
          return { name: l.text, slug, url: l.url, logo: unitLogo(slug), group: t.title };
        }),
    );
}

/** Research centers from the Araştırma page (includes ones without a website). */
export function getResearchCenters(): { text: string; url: string | null }[] {
  const { body } = getPage("arastirma-deu");
  return [...body.matchAll(/^\s*\+\s+(.+)$/gm)].map((m) => {
    const link = m[1].match(/^\[(.+?)\]\((.+?)\)/);
    return link ? { text: link[1].trim(), url: link[2] } : { text: m[1].trim(), url: null };
  });
}

export function getResearchTabs(): Tab[] {
  return getSite().research.filter((t) => t.links.length && !t.title.startsWith("Uygulama"));
}

export function getLabsIntro(): string {
  const { body } = getPage("arastirma-deu");
  return body.split(/\n{2,}/).find((p) => p.startsWith("Dokuz Eylül Üniversitesi’nin bilimsel")) ?? "";
}

export function getCoordinatorships(): Link[] {
  return getSite().academicUnits.find((t) => t.title === "Koordinatörlükler")?.links ?? [];
}

/* ----------------------------------------------------------------- stats */

type StatTable = { title: string | null; columns: string[]; rows: string[][] };
type StatPage = {
  slug: string;
  title: string;
  headline: { label: string; value: number }[] | null;
  tables: StatTable[];
};

const num = (s: string) => Number(s.replace(/\./g, "").replace(",", ".")) || 0;

export function getStats() {
  const pages = json<StatPage[]>("stats/index.json");
  const by = (slug: string) => pages.find((p) => p.slug === slug);
  const students = by("index")?.headline ?? [];
  const studentTotal = students.reduce((a, b) => a + b.value, 0);

  const table = (slug: string, i = 0) => {
    const t = by(slug)?.tables[i];
    if (!t) return null;
    return {
      title: t.title ?? "",
      columns: t.columns,
      rows: t.rows.map((r) => ({ label: r[0], values: r.slice(1).map(num) })),
    };
  };

  const academic = table("akademik-personel");
  const academicNow = academic?.rows.find((r) => r.label === "Güncel") ?? academic?.rows.at(-1);
  const staff = table("idari-personel");
  const staffNow = staff?.rows.find((r) => r.label === "Güncel") ?? staff?.rows.at(-1);
  const physical = by("fiziksel-veriler-ve-sosyal-veriler")?.tables.map((t) => ({
    title: t.title ?? "",
    rows: t.rows.map((r) => ({ label: r[0], value: num(r[1]) })),
  }));

  return {
    students,
    studentTotal,
    studentsByYear: table("ogrenci-sayisi-ve-dagilim"),
    academic,
    academicTotal: academicNow?.values.at(-1) ?? 0,
    professors: academicNow?.values[0] ?? 0,
    staff,
    staffTotal: staffNow?.values.at(-1) ?? 0,
    physical: physical ?? [],
  };
}

/* --------------------------------------------------------------- history */

/** Split the Tarihçe page into year-keyed milestones. */
export function getTimeline(): { year: string; text: string }[] {
  const { body } = getPage("tarihce");
  const paras = body
    .split(/\n{2,}/)
    .map((p) => p.replace(/[*_#]/g, "").trim())
    .filter((p) => p.length > 60);
  const out: { year: string; text: string }[] = [];
  for (const p of paras) {
    const y = p.match(/\b(19[89]\d|20[0-2]\d)\b/);
    if (!y) {
      if (out.length) out[out.length - 1].text += " " + p;
      continue;
    }
    const prev = out.at(-1);
    if (prev && prev.year === y[1]) prev.text += " " + p;
    else out.push({ year: y[1], text: p });
  }
  return out;
}

export function listSlugs(dir: "news" | "announcements"): string[] {
  return readdirSync(path.join(ROOT, dir))
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

/* ------------------------------------------------------------ leadership */

export type Person = { role: string; name: string; email: string | null; photo: Media | null; tier: number };

/** People cards from the management pages (photo, bold role, name, email). */
export function getLeadership(): Person[] {
  const pages = ["rektor", "rektor-yardimcilari", "genel-sekreter", "genel-sekreter-yardimcilari"];
  return pages.flatMap((slug, tier) =>
    getPage(slug)
      .body.split(/(?=!\[)/)
      .filter((seg) => seg.startsWith("!["))
      .map((seg) => {
        const img = seg.match(/^!\[[^\]]*\]\(([^)]+)\)/)?.[1];
        const role = seg.match(/\*\*(.+?)\*\*/)?.[1]?.trim() ?? "";
        const lines = seg
          .replace(/^!\[[^\]]*\]\([^)]+\)/, "")
          .replace(/\[[^\]]*\]\([^)]*\)/g, "")
          .replace(/\*\*.+?\*\*/, "")
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        const emailLine = lines.find((l) => l.includes("(@)"));
        const name = lines.find((l) => l !== emailLine) ?? "";
        return {
          role,
          name,
          email: emailLine ? emailLine.replace("(@)", "@") : null,
          photo: media(img, name),
          tier,
        };
      })
      .filter((p) => p.name && p.role),
  );
}
