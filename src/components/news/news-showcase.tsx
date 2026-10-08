"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { NewsItem } from "@/lib/content";
import { formatDate } from "@/lib/text";
import { Reveal } from "../motion/reveal";
import { SplitText } from "../motion/split-text";
import { ArrowLink } from "../ui/button";
import { Photo } from "../ui/photo";
import { NewsCard } from "./news-card";

type Item = Pick<NewsItem, "slug" | "title" | "date" | "categories" | "cover" | "excerpt">;

export function NewsShowcase({ featured, side, rail }: { featured: Item; side: Item[]; rail: Item[] }) {
  return (
    <section className="py-28 sm:py-36">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow text-deu">
              <span className="h-px w-8 bg-current" /> Gündem
            </p>
            <SplitText
              className="display mt-5 text-5xl sm:text-7xl"
              parts={["Kampüsten", { text: "haberler", className: "serif-accent text-deu" }]}
            />
          </div>
          <ArrowLink href="/haberler" className="text-deu">
            Tüm haberler
          </ArrowLink>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <NewsCard item={featured} size="lg" />
          </Reveal>
          <div className="flex flex-col divide-y divide-line lg:col-span-5">
            {side.map((n, i) => (
              <Reveal key={n.slug} delay={0.1 * i} className="py-5 first:pt-0">
                <Link href={`/haberler/${n.slug}`} className="group flex gap-5">
                  <Photo
                    media={n.cover}
                    sizes="160px"
                    className="aspect-[4/3] w-32 shrink-0 rounded-2xl sm:w-40"
                    imgClassName="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-110"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink/65">{formatDate(n.date)}</p>
                    <h3 className="mt-2 line-clamp-3 font-semibold leading-snug tracking-tight transition-colors group-hover:text-deu">
                      {n.title}
                    </h3>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <Rail items={rail} />
    </section>
  );
}

/** Drag-to-scroll strip of news cards with arrow buttons and a progress bar. */
function Rail({ items }: { items: Item[] }) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [max, setMax] = useState(0);
  const [dragging, setDragging] = useState(false);
  const progress = useTransform(x, (v) => (max ? -v / max : 0));
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const measure = () => {
      if (!viewport.current || !track.current) return;
      setMax(Math.max(0, track.current.scrollWidth - viewport.current.clientWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    return () => ro.disconnect();
  }, []);

  useMotionValueEvent(x, "change", (v) => {
    setAtStart(v > -4);
    setAtEnd(v < -max + 4);
  });

  const step = (dir: 1 | -1) => {
    const w = viewport.current?.clientWidth ?? 600;
    const target = Math.min(0, Math.max(-max, x.get() - dir * w * 0.8));
    animate(x, target, { type: "spring", stiffness: 140, damping: 24 });
  };

  return (
    <div className="mt-24">
      <div className="container-x flex items-center justify-between">
        <p className="text-sm font-semibold text-ink/70">Daha fazla haber</p>
        <div className="flex gap-2">
          {[
            { dir: -1 as const, Icon: ArrowLeft, disabled: atStart, label: "Önceki" },
            { dir: 1 as const, Icon: ArrowRight, disabled: atEnd, label: "Sonraki" },
          ].map(({ dir, Icon, disabled, label }) => (
            <button
              key={dir}
              type="button"
              onClick={() => step(dir)}
              disabled={disabled}
              aria-label={label}
              className="grid size-12 place-items-center rounded-full border border-line transition-all hover:border-deu hover:bg-deu hover:text-white active:scale-90 disabled:pointer-events-none disabled:opacity-30"
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </div>
      <div ref={viewport} className="mt-8 cursor-grab overflow-hidden active:cursor-grabbing">
        <motion.div
          ref={track}
          drag="x"
          dragConstraints={{ left: -max, right: 0 }}
          dragElastic={0.08}
          onDragStart={() => setDragging(true)}
          onDragEnd={() => setTimeout(() => setDragging(false), 50)}
          style={{ x }}
          className="flex w-max gap-6 px-4 sm:px-6 lg:px-[max(2.5rem,calc((100vw-1440px)/2+2.5rem))]"
          onClickCapture={(e) => dragging && e.preventDefault()}
        >
          {items.map((n) => (
            <div key={n.slug} className="w-[78vw] shrink-0 sm:w-[360px]">
              <NewsCard item={n} draggable={false} />
            </div>
          ))}
        </motion.div>
      </div>
      <div className="container-x mt-10">
        <div className="h-0.5 overflow-hidden rounded-full bg-line">
          <motion.div style={{ scaleX: progress }} className="h-full origin-left bg-deu" />
        </div>
      </div>
    </div>
  );
}
