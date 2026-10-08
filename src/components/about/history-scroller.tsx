"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { useRef, useState } from "react";

/** Sticky year counter that follows the milestone being read, with a progress rail. */
export function HistoryScroller({ items }: { items: { year: string; text: string }[] }) {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 60%", "end 60%"] });
  const rail = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <div ref={ref} className="grid gap-10 lg:grid-cols-12">
      <div className="hidden lg:col-span-5 lg:block">
        <div className="sticky top-32">
          <div className="relative h-[180px] overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={items[active].year}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute text-[180px] font-semibold leading-none tracking-[-0.06em] text-deu"
              >
                {items[active].year}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="mt-8 flex flex-wrap gap-1.5">
            {items.map((t, i) => (
              <span
                key={t.year}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-8 bg-deu" : i < active ? "w-3 bg-deu/40" : "w-3 bg-line"}`}
              />
            ))}
          </div>
          <p className="mt-6 text-sm text-ink/50">
            {active + 1} / {items.length} kilometre taşı
          </p>
        </div>
      </div>

      <div className="relative lg:col-span-7">
        <div className="absolute bottom-0 left-[7px] top-0 w-px bg-line" />
        <motion.div style={{ scaleY: rail }} className="absolute bottom-0 left-[7px] top-0 w-px origin-top bg-deu" />
        <ol className="space-y-16">
          {items.map((t, i) => (
            <motion.li
              key={t.year}
              onViewportEnter={() => setActive(i)}
              viewport={{ margin: "-45% 0px -45% 0px" }}
              initial={{ opacity: 0.25 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative pl-12"
            >
              <span
                className={`absolute left-0 top-2 size-[15px] rounded-full border-2 transition-all duration-500 ${i <= active ? "border-deu bg-deu" : "border-line bg-paper"}`}
              />
              <p className="text-3xl font-semibold tracking-tight lg:hidden">{t.year}</p>
              <p className="eyebrow hidden text-deu lg:flex">{t.year}</p>
              <p className="mt-3 text-lg leading-relaxed text-ink/70">{t.text}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
}
