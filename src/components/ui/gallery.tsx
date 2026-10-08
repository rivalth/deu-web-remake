"use client";

import { useLenis } from "lenis/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Media } from "@/lib/media";
import { Portal } from "./portal";

/** Thumbnail grid that opens a swipeable, keyboard-driven lightbox. */
export function Gallery({ items, title }: { items: Media[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const lenis = useLenis();

  const go = useCallback(
    (d: number) => {
      setDir(d);
      setOpen((i) => (i === null ? i : (i + d + items.length) % items.length));
    },
    [items.length],
  );

  useEffect(() => {
    if (open === null) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go, lenis]);

  if (!items.length) return null;
  const current = open !== null ? items[open] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((m, i) => (
          <motion.button
            key={m.src}
            type="button"
            onClick={() => setOpen(i)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: (i % 6) * 0.05,
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`group relative overflow-hidden rounded-2xl bg-paper-deep ${i === 0 ? "col-span-2 row-span-2 aspect-square sm:aspect-auto" : "aspect-[4/3]"}`}
            aria-label={`Fotoğraf ${i + 1}`}
          >
            <Image
              src={m.src}
              alt=""
              fill
              sizes="(min-width: 640px) 33vw, 50vw"
              placeholder={m.blurDataURL ? "blur" : "empty"}
              blurDataURL={m.blurDataURL}
              className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-110"
            />
            <span className="absolute inset-0 bg-navy/0 transition-colors duration-500 group-hover:bg-navy/20" />
          </motion.button>
        ))}
      </div>

      <Portal>
        <AnimatePresence>
          {current && open !== null && (
            <motion.div
              className="fixed inset-0 z-[60] flex flex-col bg-navy/95 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              role="dialog"
              aria-modal="true"
              aria-label={title}
            >
              <div className="flex items-center justify-between p-5 text-white">
                <span className="text-sm tabular-nums text-white/60">
                  {open + 1} / {items.length}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  aria-label="Kapat"
                  className="grid size-11 place-items-center rounded-full bg-white/10 transition-transform hover:rotate-90"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="relative flex-1 overflow-hidden">
                <AnimatePresence initial={false} custom={dir} mode="popLayout">
                  <motion.div
                    key={current.src}
                    custom={dir}
                    variants={{
                      enter: (d: number) => ({
                        x: `${d * 60}%`,
                        opacity: 0,
                        scale: 0.92,
                      }),
                      center: { x: 0, opacity: 1, scale: 1 },
                      exit: (d: number) => ({
                        x: `${d * -60}%`,
                        opacity: 0,
                        scale: 0.92,
                      }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.6}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -80) go(1);
                      else if (info.offset.x > 80) go(-1);
                    }}
                    className="absolute inset-4 sm:inset-x-24"
                  >
                    <Image src={current.src} alt="" fill sizes="100vw" className="pointer-events-none object-contain" />
                  </motion.div>
                </AnimatePresence>
                {items.length > 1 &&
                  ([-1, 1] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => go(d)}
                      aria-label={d < 0 ? "Önceki" : "Sonraki"}
                      className={`absolute top-1/2 hidden size-14 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-navy sm:grid ${d < 0 ? "left-5" : "right-5"}`}
                    >
                      {d < 0 ? <ChevronLeft className="size-6" /> : <ChevronRight className="size-6" />}
                    </button>
                  ))}
              </div>
              <div className="flex justify-center gap-2 overflow-x-auto p-5">
                {items.map((m, i) => (
                  <button
                    key={m.src}
                    type="button"
                    onClick={() => {
                      setDir(i > open ? 1 : -1);
                      setOpen(i);
                    }}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-all ${i === open ? "opacity-100 ring-2 ring-white" : "opacity-40 hover:opacity-80"}`}
                    aria-label={`Fotoğraf ${i + 1}`}
                  >
                    <Image src={m.src} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
