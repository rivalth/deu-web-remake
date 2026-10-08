import { Mail } from "lucide-react";
import type { Metadata } from "next";
import { BrandColors } from "@/components/about/brand-colors";
import { HistoryScroller } from "@/components/about/history-scroller";
import { ValuesGrid } from "@/components/about/values-grid";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { Tilt } from "@/components/motion/tilt";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Photo } from "@/components/ui/photo";
import { getLeadership, getNews, getPage, getTimeline } from "@/lib/content";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Dokuz Eylül Üniversitesi'nin misyonu, vizyonu, temel değerleri, tarihçesi ve yönetimi.",
};

const quote = (slug: string) => getPage(slug).body.match(/“(.+?)”/)?.[1] ?? "";

export default function AboutPage() {
  const values = [...getPage("temel-degerlerimiz").body.matchAll(/\*\*\*(.+?)\*\*\*/g)].map((m) => m[1]);
  const timeline = getTimeline();
  const people = getLeadership();
  const rector = people.find((p) => p.tier === 0);
  const others = people.filter((p) => p.tier > 0);
  const cover = getNews().find((n) => n.slug.startsWith("cwur-2026"))?.lead;

  return (
    <>
      <PageHeader
        eyebrow="Üniversitemiz"
        title={["1982'den beri", { text: "İzmir'in", className: "serif-accent text-deu" }, "bilim merkezi."]}
        description="20 Temmuz 1982'de kurulan Dokuz Eylül Üniversitesi; adını İzmir'in kurtuluş gününden alır ve eğitim, araştırma ve toplumsal katkıyı bir arada yürütür."
        crumbs={[{ label: "Hakkımızda", href: "/hakkimizda" }]}
        image={cover}
      />

      <section className="container-x grid gap-4 py-24 sm:py-32 lg:grid-cols-2">
        {[
          { label: "Misyonumuz", text: quote("misyonumuz"), cls: "bg-deu text-white", accent: "text-deu-sky" },
          { label: "Vizyonumuz", text: quote("vizyonumuz"), cls: "bg-white", accent: "text-deu" },
        ].map((b, i) => (
          <Reveal key={b.label} delay={i * 0.1}>
            <Tilt max={4} className="h-full rounded-[2rem]">
              <div className={`flex h-full min-h-80 flex-col justify-between rounded-[2rem] p-10 sm:p-14 ${b.cls}`}>
                <p className={`eyebrow ${b.accent}`}>{b.label}</p>
                <p className="mt-10 font-serif text-3xl leading-tight sm:text-4xl">“{b.text}”</p>
              </div>
            </Tilt>
          </Reveal>
        ))}
      </section>

      <section className="grain bg-navy py-24 text-white sm:py-32">
        <div className="container-x">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow text-deu-sky">
                <span className="h-px w-8 bg-current" /> Temel değerlerimiz
              </p>
              <SplitText
                className="display mt-5 text-5xl sm:text-6xl"
                parts={["Bizi biz yapan", { text: values.length + " değer", className: "serif-accent text-deu-sky" }]}
              />
            </div>
          </div>
          <ValuesGrid values={values} />
        </div>
      </section>

      <section id="tarihce" className="container-x scroll-mt-24 py-24 sm:py-32">
        <div className="mb-16 max-w-3xl">
          <p className="eyebrow text-deu">
            <span className="h-px w-8 bg-current" /> Tarihçe
          </p>
          <SplitText
            className="display mt-5 text-5xl sm:text-7xl"
            parts={[{ text: String(timeline.length), className: "text-deu" }, "kilometre taşı,", { text: "tek hikâye", className: "serif-accent text-deu" }]}
          />
        </div>
        <HistoryScroller items={timeline} />
      </section>

      <section id="yonetim" className="scroll-mt-24 bg-white py-24 sm:py-32">
        <div className="container-x">
          <div className="mb-14">
            <p className="eyebrow text-deu">
              <span className="h-px w-8 bg-current" /> Yönetim
            </p>
            <SplitText className="display mt-5 text-5xl sm:text-6xl" parts={["Üst", { text: "yönetim", className: "serif-accent text-deu" }]} />
          </div>
          <div className="grid gap-10 lg:grid-cols-12">
            {rector && (
              <Reveal className="lg:col-span-5">
                <div className="group">
                  <Photo
                    media={rector.photo}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="aspect-[4/5] rounded-[2rem]"
                    imgClassName="object-top transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-105"
                  />
                  <p className="eyebrow mt-6 text-deu">{rector.role}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">{rector.name}</p>
                </div>
              </Reveal>
            )}
            <Stagger className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-span-7" stagger={0.06}>
              {others.map((p) => (
                <StaggerItem key={p.name} className="group">
                  <Photo
                    media={p.photo}
                    sizes="(min-width: 1024px) 18vw, 45vw"
                    className="aspect-[3/4] rounded-3xl"
                    imgClassName="object-top grayscale-[35%] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  />
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-deu">{p.role}</p>
                  <p className="mt-1 font-semibold leading-snug">{p.name}</p>
                  {p.email && (
                    <a
                      href={`mailto:${p.email}`}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink/70 transition-colors hover:text-deu"
                    >
                      <Mail className="size-3" /> {p.email}
                    </a>
                  )}
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      <section className="container-x py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow text-deu">
              <span className="h-px w-8 bg-current" /> Kurumsal kimlik
            </p>
            <h2 className="display mt-5 text-4xl sm:text-5xl">
              Mavinin <span className="serif-accent text-deu">anlamı</span>
            </h2>
            <p className="mt-6 text-ink/70">
              Amblemimiz, İzmir Cumhuriyet Meydanı&apos;ndaki Atatürk Anıtı&apos;ndan türetilmiştir. Renk değerini
              kopyalamak için bir renge tıklayın.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/deu-tr-blue.svg" alt="Dokuz Eylül Üniversitesi amblemi" className="mt-10 h-36 w-auto" />
            <div className="mt-10">
              <Button href="https://kurumsalkimlik.deu.edu.tr/" variant="ghost">
                Kılavuz ve logolar
              </Button>
            </div>
          </div>
          <div className="lg:col-span-8">
            <BrandColors />
          </div>
        </div>
      </section>
    </>
  );
}
