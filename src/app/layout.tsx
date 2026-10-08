import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Providers } from "@/components/site/providers";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { getAnnouncements, getNews, getSite, getUnits, UNIT_GROUPS } from "@/lib/content";
import { ABOUT_LINKS, RESEARCH_LINKS, type SearchItem } from "@/lib/nav";
import { formatDate } from "@/lib/text";
// self-hosted fonts (no build-time fetch); unicode-range keeps Turkish glyphs in latin-ext
import "@fontsource-variable/montserrat/wght.css";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  // URL is set by Netlify at build time
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL ?? "http://localhost:3000"),
  title: {
    default: "Dokuz Eylül Üniversitesi",
    template: "%s · Dokuz Eylül Üniversitesi",
  },
  description:
    "Girişimcilik ve yenilikçilik alanında geleceğe yön veren; eğitim ve bilim merkezi bir üniversite. İzmir, 1982.",
};

export const viewport: Viewport = {
  themeColor: "#03182c",
};

function buildSearch(): SearchItem[] {
  const pages: SearchItem[] = [
    { group: "Sayfalar", title: "Ana sayfa", href: "/" },
    { group: "Sayfalar", title: "Akademik birimler", href: "/akademik", hint: "Fakülte, enstitü, yüksekokul" },
    { group: "Sayfalar", title: "Haberler", href: "/haberler" },
    { group: "Sayfalar", title: "Duyurular", href: "/duyurular" },
    ...[...ABOUT_LINKS, ...RESEARCH_LINKS].map((l) => ({
      group: "Sayfalar" as const,
      title: l.label,
      href: l.href,
      hint: l.hint,
    })),
  ];
  const units: SearchItem[] = getUnits().map((u) => ({
    group: "Akademik birimler",
    title: u.name,
    href: u.url,
    hint: u.group,
  }));
  const news: SearchItem[] = getNews().map((n) => ({
    group: "Haberler",
    title: n.title,
    href: `/haberler/${n.slug}`,
    hint: formatDate(n.date),
  }));
  const ann: SearchItem[] = getAnnouncements().map((a) => ({
    group: "Duyurular",
    title: a.title,
    href: `/duyurular/${a.slug}`,
    hint: formatDate(a.date),
  }));
  return [...pages, ...units, ...news, ...ann];
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  const site = getSite();
  const units = getUnits();
  const latest = getNews()[0];
  const unitGroups = UNIT_GROUPS.map((group) => {
    const list = units.filter((u) => u.group === group);
    return {
      group,
      count: list.length,
      sample: list.slice(0, 4).map((u) => u.name.replace(/ (Fakültesi|Enstitüsü|Meslek Yüksekokulu|Yüksekokulu)$/, "")),
    };
  });
  const quickLinks = [
    ...site.topLinks.filter((l) => !/engelsiz|adayogrenci/i.test(l.url)),
    { text: "Web Kayıt", url: "http://kayit.deu.edu.tr/" },
    { text: "Kütüphane", url: "https://kutuphane.deu.edu.tr/" },
    { text: "AVESİS", url: "https://avesis.deu.edu.tr/" },
  ];

  return (
    <html lang="tr" className="antialiased">
      <body className="flex min-h-dvh flex-col font-sans">
        <a
          href="#icerik"
          className="fixed left-4 top-4 z-[70] -translate-y-24 rounded-full bg-deu px-4 py-2 text-sm font-semibold text-white focus:translate-y-0"
        >
          İçeriğe geç
        </a>
        <Providers>
          <ScrollProgress />
          <Header
            quickLinks={quickLinks}
            search={buildSearch()}
            unitGroups={unitGroups}
            featured={{ title: latest.title, href: `/haberler/${latest.slug}`, cover: latest.cover }}
          />
          <main id="icerik" className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
