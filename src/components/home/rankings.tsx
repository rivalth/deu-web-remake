"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Stagger, StaggerItem } from "../motion/reveal";
import { SplitText } from "../motion/split-text";
import { Tilt } from "../motion/tilt";

export type Ranking = { value: string; unit?: string; title: string; body: string; href: string; source: string };

export function Rankings({ items }: { items: Ranking[] }) {
  return (
    <section className="relative overflow-hidden bg-paper-deep py-28 sm:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 size-[640px] rounded-full bg-deu-sky/30 blur-[120px]"
      />
      <div className="container-x relative">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-deu">
              <span className="h-px w-8 bg-current" /> Dünyada DEÜ
            </p>
            <SplitText
              className="display mt-5 text-5xl sm:text-6xl"
              parts={["Uluslararası", { text: "sıralamalarda", className: "serif-accent text-deu" }, "yükselen bir üniversite."]}
            />
          </div>
          <p className="self-end text-lg text-ink/60 lg:col-span-5 lg:col-start-8">
            Sürdürülebilirlikten bilimsel üretime, Dokuz Eylül&apos;ün başarısı bağımsız küresel değerlendirmelerle
            tescilli.
          </p>
        </div>

        <Stagger className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
          {items.map((r, i) => (
            <StaggerItem key={r.title} className={i === 0 ? "lg:row-span-2" : ""}>
              <Tilt className="h-full rounded-[2rem]" max={6}>
                <Link
                  href={r.href}
                  {...(r.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  className={
                    "group flex h-full min-h-64 flex-col justify-between rounded-[2rem] p-8 transition-shadow duration-500 hover:shadow-2xl hover:shadow-deu/15 " +
                    (i === 0 ? "bg-deu text-white" : "bg-white text-ink")
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className={"text-xs font-semibold uppercase tracking-[0.16em] " + (i === 0 ? "text-deu-sky" : "text-deu")}>
                      {r.source}
                    </span>
                    <ArrowUpRight className="size-5 opacity-40 transition-all duration-500 group-hover:rotate-45 group-hover:opacity-100" />
                  </div>
                  <div className="[transform:translateZ(40px)]">
                    <p className={"font-semibold tracking-[-0.05em] " + (i === 0 ? "text-[120px] leading-none sm:text-[160px]" : "text-7xl")}>
                      {r.value}
                      {r.unit && <span className="serif-accent ml-2 text-[0.4em] tracking-normal">{r.unit}</span>}
                    </p>
                    <p className="mt-4 text-lg font-semibold leading-snug">{r.title}</p>
                    <p className={"mt-2 text-sm leading-relaxed " + (i === 0 ? "text-white/70" : "text-ink/55")}>{r.body}</p>
                  </div>
                </Link>
              </Tilt>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
