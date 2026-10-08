import Link from "next/link";
import { getSite } from "@/lib/content";
import { ABOUT_LINKS, CANDIDATE_URL } from "@/lib/nav";
import { Button } from "../ui/button";
import { Logo } from "../ui/logo";
import { socialIcon } from "../ui/social-icons";
import { BackToTop, FooterMark } from "./footer-parts";

const INSTITUTIONAL = [
  "Sayılarla D.E.Ü.",
  "BURSLAR / STAJLAR",
  "KALİTE KOORDİNATÖRLÜĞÜ",
  "STRATEJİK PLAN 2026-2030",
  "İDARE FAALİYET RAPORLARI",
  "KİŞİSEL VERİLERİN KORUNMASI",
  "Engelsiz DEÜ Koordinatörlüğü",
  "HRS4R",
];

const titleCase = (s: string) =>
  s === s.toLocaleUpperCase("tr-TR")
    ? s
        .toLocaleLowerCase("tr-TR")
        .replace(/(^|\s|\/)(\p{L})/gu, (_, a, b: string) => a + b.toLocaleUpperCase("tr-TR"))
        .replace(/\bHrs4r\b/, "HRS4R")
    : s;

export function Footer() {
  const site = getSite();
  const footerLinks = site.footer.links.filter((l) => l.url.startsWith("http"));
  const institutional = INSTITUTIONAL.map((t) => footerLinks.find((l) => l.text === t)).filter(Boolean) as {
    text: string;
    url: string;
  }[];
  const socials = [...new Set(site.social)]
    .filter((u) => !u.includes("watch?"))
    .map((url) => ({ url, ...socialIcon(url)! }))
    .filter((s) => s.Icon);

  return (
    <footer className="grain relative mt-auto overflow-hidden bg-navy text-white">
      <div className="container-x relative pt-24 sm:pt-32">
        <div className="flex flex-col items-start justify-between gap-10 border-b border-white/10 pb-16 lg:flex-row lg:items-end">
          <h2 className="display max-w-3xl text-5xl sm:text-7xl">
            Geleceğe yön veren <span className="serif-accent text-deu-sky">bilim.</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button href={CANDIDATE_URL} variant="light">
              Aday öğrenci
            </Button>
            <Button href="/haberler" variant="ghost-light">
              Haberler
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 py-16 md:grid-cols-4 lg:grid-cols-12">
          <div className="col-span-2 md:col-span-4 lg:col-span-4">
            <Logo tone="light" />
            <address className="mt-8 max-w-xs text-sm not-italic leading-relaxed text-white/60">
              Cumhuriyet Bulvarı No: 144
              <br />
              35210 Alsancak / İzmir
              <br />
              <a href="tel:+902324121212" className="mt-3 inline-block text-white transition-colors hover:text-deu-sky">
                +90 (232) 412 12 12
              </a>
              <br />
              <span className="text-white/40">KEP:</span> dokuzeyluluniversitesi@hs01.kep.tr
            </address>
            <div className="mt-8 flex gap-2">
              {socials.map(({ url, Icon, label }) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid size-11 place-items-center rounded-full border border-white/15 transition-all duration-300 hover:-translate-y-1 hover:border-white hover:bg-white hover:text-navy"
                >
                  <Icon className="size-[18px]" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Üniversite" links={ABOUT_LINKS.map((l) => ({ text: l.label, url: l.href }))} />
          <FooterCol
            title="Keşfet"
            links={[
              { text: "Akademik birimler", url: "/akademik" },
              { text: "Araştırma", url: "/arastirma" },
              { text: "Haberler", url: "/haberler" },
              { text: "Duyurular", url: "/duyurular" },
              { text: "Kütüphane", url: "https://kutuphane.deu.edu.tr/" },
              { text: "Öğrenci toplulukları", url: "https://ogrencitopluluklari.deu.edu.tr/" },
            ]}
          />
          <FooterCol title="Hızlı erişim" links={site.topLinks.filter((l) => !l.url.includes("engelsiz"))} />
          <FooterCol title="Kurumsal" links={institutional.map((l) => ({ ...l, text: titleCase(l.text) }))} />
        </div>

        <div className="flex flex-col items-start justify-between gap-6 border-t border-white/10 py-8 text-xs text-white/45 sm:flex-row sm:items-center">
          <p>
            © Dokuz Eylül Üniversitesi · İzmir, 1982. Bu site bağımsız bir yeniden tasarım çalışmasıdır.
          </p>
          <BackToTop />
        </div>
      </div>
      <FooterMark />
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { text: string; url: string }[] }) {
  return (
    <div className="lg:col-span-2">
      <p className="eyebrow text-white/40">{title}</p>
      <ul className="mt-5 space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.url + l.text}>
            <Link
              href={l.url}
              {...(l.url.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
              className="link-underline text-white/75 transition-colors hover:text-white"
            >
              {l.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
