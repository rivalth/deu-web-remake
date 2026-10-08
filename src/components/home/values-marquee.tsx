"use client";

import { motion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";

/** Core values as an endless ribbon that skews with scroll velocity. */
export function ValuesMarquee({ values }: { values: string[] }) {
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { stiffness: 300, damping: 50 });
  const skew = useTransform(velocity, [-2000, 0, 2000], [6, 0, -6], { clamp: true });
  const row = [...values, ...values];

  return (
    <section aria-label="Temel değerlerimiz" className="relative overflow-hidden border-y border-line bg-paper py-7">
      <motion.div style={{ skewX: skew }} className="group flex w-max">
        <div className="flex animate-marquee items-center [--marquee-duration:55s] group-hover:[animation-play-state:paused]">
          {row.map((v, i) => (
            <span key={i} className="flex items-center">
              <span
                className={
                  i % 2
                    ? "serif-accent px-8 text-5xl text-deu sm:text-6xl"
                    : "px-8 text-5xl font-semibold uppercase tracking-tight text-transparent [-webkit-text-stroke:1.5px_var(--color-ink)] transition-colors duration-500 hover:text-ink sm:text-6xl"
                }
              >
                {v}
              </span>
              <svg viewBox="0 0 24 24" className="size-6 shrink-0 text-gold" aria-hidden>
                <path d="M12 0c.8 6.6 5.4 11.2 12 12-6.6.8-11.2 5.4-12 12-.8-6.6-5.4-11.2-12-12C6.6 11.2 11.2 6.6 12 0Z" fill="currentColor" />
              </svg>
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
