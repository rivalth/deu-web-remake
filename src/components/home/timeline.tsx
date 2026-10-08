"use client";

import { motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SplitText } from "../motion/split-text";
import { ArrowLink } from "../ui/button";

/** Draggable ribbon of founding milestones. */
export function Timeline({ items }: { items: { year: string; text: string }[] }) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [max, setMax] = useState(0);
  const x = useMotionValue(0);
  const lineScale = useTransform(x, (v) => (max ? 0.08 + 0.92 * (-v / max) : 1));

  useEffect(() => {
    const measure = () => {
      if (viewport.current && track.current) setMax(Math.max(0, track.current.scrollWidth - viewport.current.clientWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <section className="overflow-hidden py-28 sm:py-36">
      <div className="container-x flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow text-deu">
            <span className="h-px w-8 bg-current" /> Tarihçe
          </p>
          <SplitText
            className="display mt-5 text-5xl sm:text-7xl"
            parts={["1982'den", { text: "bugüne", className: "serif-accent text-deu" }]}
          />
        </div>
        <div className="flex items-center gap-6">
          <p className="hidden text-sm text-ink/50 sm:block">← Sürükleyin →</p>
          <ArrowLink href="/hakkimizda#tarihce" className="text-deu">
            Tüm tarihçe
          </ArrowLink>
        </div>
      </div>

      <div ref={viewport} className="mt-16 cursor-grab active:cursor-grabbing">
        <motion.div
          ref={track}
          drag="x"
          dragConstraints={{ left: -max, right: 0 }}
          dragElastic={0.06}
          style={{ x }}
          className="relative flex w-max px-4 sm:px-6 lg:px-[max(2.5rem,calc((100vw-1440px)/2+2.5rem))]"
        >
          <div className="absolute inset-x-0 top-[22px] h-px bg-line" />
          <motion.div style={{ scaleX: lineScale }} className="absolute inset-x-0 top-[22px] h-px origin-left bg-deu" />
          {items.map((t, i) => (
            <motion.div
              key={t.year}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: Math.min(i, 6) * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="group relative w-[300px] shrink-0 select-none pr-10"
            >
              <span className="relative z-10 grid size-11 place-items-center rounded-full border border-line bg-paper transition-all duration-500 group-hover:scale-110 group-hover:border-deu group-hover:bg-deu">
                <span className="size-2 rounded-full bg-deu transition-colors group-hover:bg-white" />
              </span>
              <p className="mt-6 text-6xl font-semibold tracking-[-0.05em] text-ink transition-colors duration-500 group-hover:text-deu">
                {t.year}
              </p>
              <p className="mt-4 line-clamp-5 text-sm leading-relaxed text-ink/60">{t.text.replace(/^\d{4}['’]?\w*\s*(yılında|Yılında|Yılında,)?\s*/i, "")}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
