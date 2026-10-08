import type { Metadata } from "next";
import { Counter } from "@/components/motion/counter";
import { Reveal } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { NewsCard } from "@/components/news/news-card";
import { CentersDirectory } from "@/components/research/centers-directory";
import { ResearchTabs } from "@/components/research/research-tabs";
import { ArrowLink, Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Photo } from "@/components/ui/photo";
import { getLabsIntro, getNews, getResearchCenters, getResearchTabs, getStats } from "@/lib/content";

export const metadata: Metadata = {
  title: "Araştırma",
  description: "Dokuz Eylül Üniversitesi araştırma merkezleri, projeler, teknoloji transferi ve laboratuvar altyapısı.",
};

const BLURBS: Record<string, string> = {
  Projeler: "Bilimsel Araştırma Projeleri ile fikirden yayına uzanan yolculuğu destekliyoruz.",
  "Teknoloji ve İnovasyon": "Teknopark, kuluçka merkezi ve TTO ile bilgiyi ürüne dönüştürüyoruz.",
  "Bilimsel Faaliyetler": "Yayın, atıf ve bilimsel faaliyet verilerimiz açık ve izlenebilir.",
};

export default function ResearchPage() {
  const news = getNews();
  const cover = news.find((n) => n.slug.startsWith("depark-bambu"))?.lead;
  const centers = getResearchCenters();
  const tabs = getResearchTabs()
    .filter((t) => BLURBS[t.title])
    .map((t) => ({ title: t.title, blurb: BLURBS[t.title], links: t.links }));
  const labs = getStats()
    .physical.find((t) => t.title.startsWith("Eğitim"))
    ?.rows.filter((r) => /Lab/.test(r.label));
  const labTotal = labs?.reduce((a, r) => a + r.value, 0) ?? 0;
  const labPhoto = news.find((n) => n.slug.startsWith("deu-hastanesi-yogun-bakim"))?.lead;
  const related = news.filter((n) => /ar-ge|araştırma|bilim|kongre|genom|sanayi|yapay zek/i.test(n.title)).slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow="Araştırma & inovasyon"
        title={["Bilgiyi", { text: "değere", className: "serif-accent text-deu" }, "dönüştürüyoruz."]}
        description={`${centers.length} uygulama ve araştırma merkezi, ${labTotal} laboratuvar, teknopark ve teknoloji transfer ofisiyle Ege'nin araştırma ekosistemi.`}
        crumbs={[{ label: "Araştırma", href: "/arastirma" }]}
        image={cover}
      />

      <section className="container-x py-24 sm:py-32">
        <ResearchTabs tabs={tabs} />
      </section>

      <section className="grain relative overflow-hidden bg-navy py-24 text-white sm:py-32">
        <div className="container-x grid items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow text-deu-sky">
              <span className="h-px w-8 bg-current" /> Laboratuvarlar
            </p>
            <div className="mt-6 flex items-baseline gap-4">
              <Counter value={labTotal} className="text-8xl font-semibold tracking-[-0.05em]" />
              <span className="serif-accent text-3xl text-deu-sky">laboratuvar</span>
            </div>
            <div className="mt-6 flex gap-6 text-sm text-white/60">
              {labs?.map((l) => (
                <span key={l.label}>
                  <strong className="text-white">{l.value}</strong> {l.label.replace("Lab.", "laboratuvarı").toLocaleLowerCase("tr-TR")}
                </span>
              ))}
            </div>
            <p className="mt-8 line-clamp-6 max-w-xl leading-relaxed text-white/70">{getLabsIntro()}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="http://delab.deu.edu.tr/" variant="light">
                Laboratuvar yönetim sistemi
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <Photo media={labPhoto} sizes="(min-width: 1024px) 45vw, 100vw" className="aspect-[4/5] rounded-[2rem]" />
          </Reveal>
        </div>
      </section>

      <section className="container-x py-24 sm:py-32">
        <div className="mb-12 max-w-3xl">
          <p className="eyebrow text-deu">
            <span className="h-px w-8 bg-current" /> Merkezler
          </p>
          <SplitText
            className="display mt-5 text-4xl sm:text-6xl"
            parts={[`${centers.length} uygulama ve`, { text: "araştırma", className: "serif-accent text-deu" }, "merkezi"]}
          />
        </div>
        <CentersDirectory centers={centers} />
      </section>

      {related.length > 0 && (
        <section className="bg-white py-24 sm:py-32">
          <div className="container-x">
            <div className="mb-12 flex items-end justify-between">
              <h2 className="display text-4xl sm:text-5xl">
                Araştırmadan <span className="serif-accent text-deu">haberler</span>
              </h2>
              <ArrowLink href="/haberler" className="text-deu">
                Tüm haberler
              </ArrowLink>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((n, i) => (
                <Reveal key={n.slug} delay={i * 0.08}>
                  <NewsCard item={n} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
