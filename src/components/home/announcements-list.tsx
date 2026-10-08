"use client";

import { ArrowUpRight, Paperclip } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Announcement } from "@/lib/content";
import { dateParts } from "@/lib/text";
import { Logotype } from "../ui/logo";

type Item = Pick<Announcement, "slug" | "title" | "date" | "image" | "attachments">;

/** Announcement rows; hovering one floats a preview card that trails the cursor. */
export function AnnouncementsList({ items }: { items: Item[] }) {
  const [active, setActive] = useState<number | null>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 250, damping: 26, mass: 0.6 });
  const y = useSpring(useMotionValue(0), { stiffness: 250, damping: 26, mass: 0.6 });

  return (
    <div
      className="relative"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      onPointerLeave={() => setActive(null)}
    >
      <ul className="border-t border-line">
        {items.map((a, i) => {
          const d = dateParts(a.date);
          return (
            <li key={a.slug} onPointerEnter={() => setActive(i)} className="border-b border-line">
              <Link
                href={`/duyurular/${a.slug}`}
                className="group grid grid-cols-[64px_1fr_auto] items-center gap-5 py-6 transition-[padding] duration-500 ease-[var(--ease-out-expo)] hover:pl-4 sm:grid-cols-[96px_1fr_auto] sm:gap-8"
              >
                <span className="flex items-baseline gap-1.5 tabular-nums">
                  <span className="text-3xl font-semibold tracking-tight text-deu sm:text-4xl">{d?.day}</span>
                  <span className="text-xs font-semibold uppercase text-ink/45">{d?.month}</span>
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-deu sm:text-xl">
                    {a.title}
                  </span>
                  {a.attachments.length > 0 && (
                    <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-ink/45">
                      <Paperclip className="size-3" /> {a.attachments.length} ek
                    </span>
                  )}
                </span>
                <span className="grid size-11 place-items-center rounded-full border border-line transition-all duration-500 group-hover:rotate-45 group-hover:border-deu group-hover:bg-deu group-hover:text-white">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <motion.div
        aria-hidden
        style={{ x, y }}
        className="pointer-events-none absolute left-0 top-0 z-10 hidden lg:block"
      >
        <AnimatePresence>
          {active !== null && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 3 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="-translate-x-1/2 -translate-y-[115%] overflow-hidden rounded-2xl shadow-2xl shadow-navy/30"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={active}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
                  className="relative h-44 w-64"
                >
                  {items[active].image ? (
                    <Image
                      src={items[active].image.src}
                      alt=""
                      fill
                      sizes="256px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid size-full place-items-center bg-gradient-to-br from-deu to-navy">
                      <Logotype className="w-24 text-white/80" />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
