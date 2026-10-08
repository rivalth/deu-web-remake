import { AnnouncementsList } from "@/components/home/announcements-list";
import { CampusLife, type Moment } from "@/components/home/campus-life";
import { Cta } from "@/components/home/cta";
import { Hero, type Slide } from "@/components/home/hero";
import { Mission } from "@/components/home/mission";
import { Rankings, type Ranking } from "@/components/home/rankings";
import { Research } from "@/components/home/research";
import { StatsBand } from "@/components/home/stats-band";
import { Timeline } from "@/components/home/timeline";
import { ValuesMarquee } from "@/components/home/values-marquee";
import { SplitText } from "@/components/motion/split-text";
import { NewsShowcase } from "@/components/news/news-showcase";
import { ArrowLink } from "@/components/ui/button";
import { UnitsExplorer } from "@/components/units/units-explorer";
import {
  getAnnouncements,
  getNews,
  getPage,
  getResearchCenters,
  getStats,
  getTimeline,
  getUnits,
  UNIT_GROUPS,
  type NewsItem,
} from "@/lib/content";
import type { Media } from "@/lib/media";
import { nf } from "@/lib/text";

const HERO = [
  "dokuz-eylul-universitesi-egitim-yelpazesini-yeni-programlarla-guclendiriyor",
  "deu-bergama-myoda-mezuniyet-coskusu",
  "deude-2026-2027-akademik-yili-ilk-ders-heyecaniyla-basladi",
  "cwur-2026-aciklandi-deu-dunyanin-en-iyileri-arasinda",
  "deu-tip-fakultesinde-48-donem-mezuniyet-coskusu-yasandi",
];

const MOMENTS: [string, string][] = [
  ["deu-bergama-myoda-mezuniyet-coskusu", "Mezuniyet"],
  ["steinway-sons-piyanosu-deu-devlet-konservatuvarinda", "Sanat"],
  ["deulu-akademisyen-letape-by-tour-de-france-turkiye-etabinda-ikincilik-kursusune-cikti", "Spor"],
  ["deu-talksun-4-konugu-tuna-ortayli-oldu", "Söyleşi"],
  ["depark-bambu-up-demo-dayde-girisimciler-projelerini-ekosistemle-bulusturdu", "Girişimcilik"],
  ["deude-rusya-kultur-gunu-coskusu", "Kültür"],
  ["deu-dis-hekimligi-fakultesi-ilk-mezunlarini-verdi", "Sağlık"],
  ["deu-44-kurulus-yil-donumunu-tanitim-resepsiyonuyla-kutladi", "Kuruluş"],
];

const RANKINGS: (Ranking & { slug?: string })[] = [
  {
    value: "134.",
    source: "UI GreenMetric 2026",
    title: "Sürdürülebilirlikte dünyada 134. sıra",
    body: "110 ülkeden 2.016 üniversitenin değerlendirildiği sıralamada çevre ve sürdürülebilirlik başarısı.",
    slug: "deu-ui-greenmetric-2026-dunya-siralamasinda-134-sirada",
    href: "",
  },
  {
    value: "%5,7",
    source: "CWUR 2026",
    title: "Dünyanın en iyi yüzde 5,7'lik diliminde",
    body: "21 binden fazla üniversite arasında 1206. sıra.",
    slug: "cwur-2026-aciklandi-deu-dunyanin-en-iyileri-arasinda",
    href: "",
  },
  {
    value: "200",
    unit: "ilk",
    source: "THE Impact 2026",
    title: "Sanayi, yenilikçilik ve altyapıda dünyanın ilk 200'ünde",
    body: "Times Higher Education Etki Sıralamaları.",
    slug: "deuden-kuresel-olcekte-dikkat-ceken-basari-sanayi-yenilikcilik-ve-altyapida-dunyanin-ilk-200-universitesi-arasinda",
    href: "",
  },
  {
    value: "6",
    unit: "alan",
    source: "URAP 2025-2026",
    title: "Dünya alan sıralamasında 6 bilim alanında",
    body: "Akademik performansa dayalı küresel değerlendirme.",
    slug: "deu-urap-2025-2026-dunya-alan-siralamasinda-6-bilim-alaninda-yer-aldi",
    href: "",
  },
  {
    value: "5",
    unit: "yıl",
    source: "YÖKAK",
    title: "Tam kurumsal akreditasyon",
    body: "Yükseköğretim Kalite Kurulu'ndan beş yıllık tam akreditasyon.",
    href: "https://kalite.deu.edu.tr/",
  },
];

export default function Home() {
  const news = getNews();
  const bySlug = (s: string) => news.find((n) => n.slug.startsWith(s.slice(0, 60)));
  const lead = (n: NewsItem | undefined): Media | null => n?.lead ?? n?.cover ?? null;

  const slides: Slide[] = HERO.map(bySlug)
    .filter((n): n is NewsItem => !!n && !!lead(n))
    .map((n) => ({ media: lead(n)!, caption: n.title, href: `/haberler/${n.slug}` }));

  const moments: Moment[] = MOMENTS.map(([s, tag]) => {
    const n = bySlug(s);
    return n && lead(n) ? { media: lead(n)!, title: n.title, href: `/haberler/${n.slug}`, tag } : null;
  }).filter((m): m is Moment => !!m);

  const rankings: Ranking[] = RANKINGS.map((r) => {
    const n = r.slug ? bySlug(r.slug) : undefined;
    return { ...r, href: n ? `/haberler/${n.slug}` : r.href || "/haberler" };
  });

  const stats = getStats();
  const units = getUnits();
  const centers = getResearchCenters().map((c) => c.text);
  const labs = stats.physical
    .find((t) => t.title.startsWith("Eğitim"))
    ?.rows.filter((r) => /Lab/.test(r.label))
    .reduce((a, r) => a + r.value, 0);
  const values = [...getPage("temel-degerlerimiz").body.matchAll(/\*\*\*(.+?)\*\*\*/g)].map((m) => m[1]);
  const missionText = getPage("misyonumuz").body.match(/“(.+?)”/)?.[1] ?? "";

  const mission = [
    lead(bySlug("deu-ui-greenmetric-2026-dunya-siralamasinda-134-sirada")),
    lead(bySlug("deude-2026-2027-akademik-yili-ilk-ders-heyecaniyla-basladi")),
  ].filter((m): m is Media => !!m);

  const announcements = getAnnouncements().slice(0, 6);
  const count = (g: string) => units.filter((u) => u.group === g).length;

  return (
    <>
      <Hero slides={slides} students={nf.format(stats.studentTotal)} units={units.length} centers={centers.length} />
      <ValuesMarquee values={values} />
      <Mission text={missionText} images={mission} />
      <StatsBand
        stats={[
          { value: stats.studentTotal, label: "Öğrenci", note: "Önlisans, lisans ve lisansüstü programlarda" },
          { value: stats.academicTotal, label: "Akademisyen", note: `${nf.format(stats.professors)} profesör` },
          { value: count("Fakülteler"), label: "Fakülte" },
          { value: count("Enstitüler"), label: "Enstitü" },
          { value: centers.length, label: "Araştırma merkezi" },
        ]}
      />

      <section className="bg-white py-28 sm:py-36">
        <div className="container-x">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow text-deu">
                <span className="h-px w-8 bg-current" /> Akademik birimler
              </p>
              <SplitText
                className="display mt-5 max-w-3xl text-5xl sm:text-7xl"
                parts={["Tutkunu bul,", { text: "alanında", className: "serif-accent text-deu" }, "derinleş."]}
              />
            </div>
            <ArrowLink href="/akademik" className="text-deu">
              Tüm {units.length} birim
            </ArrowLink>
          </div>
          <UnitsExplorer units={units} groups={UNIT_GROUPS} limit={8} />
        </div>
      </section>

      <NewsShowcase featured={news[0]} side={news.slice(1, 4)} rail={news.slice(4, 16)} />
      <CampusLife moments={moments} />
      <Rankings items={rankings} />

      <section className="py-28 sm:py-36">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <p className="eyebrow text-deu">
                <span className="h-px w-8 bg-current" /> Duyurular
              </p>
              <SplitText
                className="display mt-5 text-5xl sm:text-6xl"
                parts={["Gündemi", { text: "kaçırmayın", className: "serif-accent text-deu" }]}
              />
              <p className="mt-6 max-w-sm text-ink/60">
                Akademik takvim, sınavlar, başvurular ve etkinliklerle ilgili güncel duyurular.
              </p>
              <ArrowLink href="/duyurular" className="mt-8 text-deu">
                Tüm duyurular
              </ArrowLink>
            </div>
          </div>
          <div className="lg:col-span-8">
            <AnnouncementsList items={announcements} />
          </div>
        </div>
      </section>

      <Research centers={centers} labs={labs ?? 0} />
      <Timeline items={getTimeline()} />
      {lead(bySlug("deu-egitim-fakultesinde-mezuniyet-coskusu")) && (
        <Cta media={lead(bySlug("deu-egitim-fakultesinde-mezuniyet-coskusu"))!} />
      )}
    </>
  );
}
