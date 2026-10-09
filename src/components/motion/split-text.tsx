"use client";

import { motion } from "motion/react";
import { Fragment, type ElementType } from "react";

type Part = string | { text: string; className?: string };

/**
 * Word-by-word masked reveal. Pass plain strings or `{ text, className }`
 * parts to style individual phrases (e.g. a serif accent word).
 */
export function SplitText({
  parts,
  as: Tag = "h2",
  className,
  delay = 0,
  stagger = 0.05,
  inView = true,
}: {
  parts: Part[];
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  inView?: boolean;
}) {
  const words: { word: string; className?: string }[] = [];
  for (const p of parts) {
    const text = typeof p === "string" ? p : p.text;
    const cls = typeof p === "string" ? undefined : p.className;
    for (const w of text.split(/\s+/).filter(Boolean)) words.push({ word: w, className: cls });
  }
  const label = words.map((w) => w.word).join(" ");

  // above-the-fold headings animate with CSS so they don't wait for hydration
  if (!inView) {
    return (
      <Tag className={className} aria-label={label}>
        <span className="inline" aria-hidden>
          {words.map((w, i) => (
            <Fragment key={i}>
              <span className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
                <span
                  className={`anim-word inline-block ${w.className ?? ""}`}
                  style={{ animationDelay: `${delay + i * stagger}s` }}
                >
                  {w.word}
                </span>
              </span>
              {i < words.length - 1 ? " " : null}
            </Fragment>
          ))}
        </span>
      </Tag>
    );
  }

  return (
    <Tag className={className} aria-label={label}>
      <motion.span initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} className="inline" aria-hidden>
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
              <motion.span
                className={`inline-block will-change-transform ${w.className ?? ""}`}
                variants={{
                  hidden: { y: "105%", rotate: 4 },
                  show: {
                    y: "0%",
                    rotate: 0,
                    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: delay + i * stagger },
                  },
                }}
              >
                {w.word}
              </motion.span>
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  );
}

