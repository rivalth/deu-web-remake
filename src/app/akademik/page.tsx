import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { Counter } from "@/components/motion/counter";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { UnitsExplorer } from "@/components/units/units-explorer";
import { getCoordinatorships, getNews, getStats, getUnits, UNIT_GROUPS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Akademik birimler",
  description: "Dokuz Eylül Üniversitesi fakülteleri, enstitüleri, yüksekokulları ve meslek yüksekokulları.",
};

export default function AcademicPage() {
  const units = getUnits();
  const stats = getStats();
  const cover = getNews().find((n) => n.slug.startsWith("deude-2026-2027-akademik-yili"))?.lead;
  const coordinatorships = getCoordinatorships();
  const count = (g: string) => units.filter((u) => u.group === g).length;

  return (
    <>
      <PageHeader
        eyebrow="Akademik"
        title={[{ text: String(units.length), className: "text-deu" }, "birim,", { text: "sonsuz", className: "serif-accent text-deu" }, "olasılık."]}
        description={`Sağlıktan mühendisliğe, sanattan denizciliğe; ${count("Fakülteler")} fakülte, ${count("Enstitüler")} enstitü, ${count("Yüksekokullar")} yüksekokul ve ${count("Meslek Yüksekokulları")} meslek yüksekokulunda önlisanstan doktoraya eğitim.`}
        crumbs={[{ label: "Akademik", href: "/akademik" }]}
        image={cover}
      >
        <div className="mt-12 grid max-w-3xl grid-cols-3 gap-6 border-t border-line pt-8">
          {[
            { v: stats.studentTotal, l: "öğrenci" },
            { v: stats.academicTotal, l: "akademisyen" },
            { v: stats.professors, l: "profesör" },
          ].map((s) => (
            <div key={s.l}>
              <Counter value={s.v} className="block text-3xl font-semibold tracking-tight sm:text-4xl" />
              <span className="text-sm text-ink/50">{s.l}</span>
            </div>
          ))}
        </div>
      </PageHeader>

      <section id="birimler" className="container-x scroll-mt-28 py-24">
        <UnitsExplorer units={units} groups={UNIT_GROUPS} syncHash />
      </section>

      <section className="bg-white py-24 sm:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow text-deu">
              <span className="h-px w-8 bg-current" /> Koordinatörlükler
            </p>
            <SplitText
              className="display mt-5 text-4xl sm:text-5xl"
              parts={["Eğitimi", { text: "destekleyen", className: "serif-accent text-deu" }, "yapılar."]}
            />
            <p className="mt-6 text-ink/60">
              Uluslararası ilişkilerden kariyer planlamaya, kaliteden sürdürülebilirliğe üniversite genelinde hizmet veren
              koordinatörlükler.
            </p>
          </div>
          <Stagger className="flex flex-wrap content-start gap-2 lg:col-span-8" stagger={0.03}>
            {coordinatorships.map((c) => (
              <StaggerItem key={c.url}>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:border-deu hover:bg-deu hover:text-white"
                >
                  {c.text}
                  <ArrowUpRight className="size-3.5 opacity-40 transition-all group-hover:rotate-45 group-hover:opacity-100" />
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="container-x py-24">
        <div className="grain relative overflow-hidden rounded-[2.5rem] bg-deu p-10 text-white sm:p-16">
          <div aria-hidden className="absolute -right-20 -top-20 size-96 rounded-full bg-deu-sky/40 blur-[100px]" />
          <div className="relative flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div>
              <p className="eyebrow text-deu-sky">AVESİS</p>
              <h2 className="display mt-4 max-w-2xl text-4xl sm:text-6xl">
                Akademisyenlerimizi <span className="serif-accent">keşfedin.</span>
              </h2>
              <p className="mt-5 max-w-xl text-white/70">
                Yayınlar, projeler ve uzmanlık alanlarıyla {stats.academicTotal.toLocaleString("tr-TR")} akademisyenin
                profili tek bir yerde.
              </p>
            </div>
            <Button href="https://avesis.deu.edu.tr/" variant="light">
              Akademisyen ara
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
