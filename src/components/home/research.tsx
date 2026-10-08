"use client";

import { ArrowUpRight, FlaskConical, Lightbulb, Microscope, Rocket } from "lucide-react";
import { motion } from "motion/react";
import { Counter } from "../motion/counter";
import { Stagger, StaggerItem } from "../motion/reveal";
import { SplitText } from "../motion/split-text";
import { Spotlight } from "../motion/spotlight";
import { Button } from "../ui/button";

const PILLARS = [
  {
    Icon: Microscope,
    title: "Uygulama ve araştırma merkezleri",
    body: "Depremden onkolojiye, denizcilikten arkeometriye uzanan disiplinlerarası merkezler.",
    href: "/arastirma",
  },
  {
    Icon: FlaskConical,
    title: "Bilimsel Araştırma Projeleri",
    body: "BAP koordinasyonuyla desteklenen projeler ve dış fon olanakları.",
    href: "https://bap.deu.edu.tr/",
  },
  {
    Icon: Rocket,
    title: "DEPARK Teknopark",
    body: "BAMBU kuluçka programıyla girişimcileri ekosistemle buluşturan teknopark.",
    href: "https://www.depark.com/",
  },
  {
    Icon: Lightbulb,
    title: "Teknoloji Transfer Ofisi",
    body: "Fikri mülkiyet, patent ve sanayi iş birlikleri için tek kapı.",
    href: "https://www.dokuzeylultto.com/",
  },
];

export function Research({ centers, labs }: { centers: string[]; labs: number }) {
  const half = Math.ceil(centers.length / 2);
  const cols = [centers.slice(0, half), centers.slice(half)];

  return (
    <section className="grain relative overflow-hidden bg-navy py-28 text-white sm:py-36">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-1/3 size-[560px] rounded-full bg-deu/50 blur-[140px]" />
      <div className="container-x relative grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="eyebrow text-deu-sky">
            <span className="h-px w-8 bg-current" /> Araştırma &amp; inovasyon
          </p>
          <SplitText
            className="display mt-5 text-5xl sm:text-7xl"
            parts={["Bilgiyi", { text: "değere", className: "serif-accent text-deu-sky" }, "dönüştürüyoruz."]}
          />
          <div className="mt-12 grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
            <div>
              <Counter value={centers.length} className="block text-6xl font-semibold tracking-tight" />
              <p className="mt-2 text-sm text-white/60">Uygulama ve araştırma merkezi</p>
            </div>
            <div>
              <Counter value={labs} className="block text-6xl font-semibold tracking-tight" />
              <p className="mt-2 text-sm text-white/60">Laboratuvar</p>
            </div>
          </div>
          <div className="mt-10">
            <Button href="/arastirma" variant="light">
              Araştırmayı keşfet
            </Button>
          </div>
        </div>

        {/* two columns of center names drifting in opposite directions */}
        <div
          aria-label="Araştırma merkezleri"
          className="relative hidden h-[560px] grid-cols-2 gap-4 overflow-hidden [mask-image:linear-gradient(transparent,black_15%,black_85%,transparent)] lg:col-span-6 lg:grid"
        >
          {cols.map((col, c) => (
            <motion.div
              key={c}
              className="flex flex-col gap-4"
              animate={{ y: c ? ["-50%", "0%"] : ["0%", "-50%"] }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
              {[...col, ...col].map((name, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm leading-snug text-white/80 backdrop-blur transition-colors hover:border-deu-sky/50 hover:bg-white/10 hover:text-white"
                >
                  {name}
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      </div>

      <Stagger className="container-x relative mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map(({ Icon, title, body, href }) => (
          <StaggerItem key={title}>
            <Spotlight className="h-full rounded-[1.75rem] border border-white/10 bg-white/[0.03] transition-colors hover:border-white/25">
              <a
                href={href}
                {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                className="group relative flex h-full flex-col p-7"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-deu-sky transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                  <Icon className="size-5" />
                </span>
                <p className="mt-8 text-lg font-semibold leading-snug">{title}</p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">{body}</p>
                <ArrowUpRight className="mt-6 size-5 text-white/40 transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-white" />
              </a>
            </Spotlight>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
