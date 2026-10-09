"use client";

import { ArrowDown, Pause, Play } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Media } from "@/lib/media";
import { Magnetic } from "../motion/magnetic";
import { SplitText } from "../motion/split-text";
import { Button } from "../ui/button";
import { VideoButton } from "./video-modal";

const DURATION = 7000;
const EASE = [0.16, 1, 0.3, 1] as const;

export type Slide = { media: Media; caption: string; href: string };

export function Hero({
  slides,
  students,
  units,
  centers,
}: {
  slides: Slide[];
  students: string;
  units: number;
  centers: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // advance slides; restart the timer whenever the index changes
  useEffect(() => {
    if (paused || reduce) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), DURATION);
    return () => clearTimeout(t);
  }, [index, paused, reduce, slides.length]);

  // scroll-out: content drifts up and fades, image zooms
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-35%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const veil = useTransform(scrollYProgress, [0, 1], [0, 0.6]);

  // subtle pointer parallax on the photo layer
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 20 });
  const py = useSpring(my, { stiffness: 60, damping: 20 });

  const slide = slides[index];

  return (
    <section
      ref={ref}
      className="relative h-[100svh] min-h-[680px] overflow-hidden bg-navy text-white"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        mx.set((e.clientX / window.innerWidth - 0.5) * -24);
        my.set((e.clientY / window.innerHeight - 0.5) * -16);
      }}
    >
      <motion.div className="absolute inset-[-24px]" style={{ scale: imageScale, x: px, y: py }}>
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0, clipPath: "inset(0 0 0 100%)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0 0%)" }}
            exit={{ opacity: 0.4 }}
            transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.14 }}
              animate={{ scale: 1.02 }}
              transition={{ duration: DURATION / 1000 + 1.5, ease: "linear" }}
            >
              <Image
                src={slide.media.src}
                alt={slide.caption}
                fill
                sizes="100vw"
                quality={85}
                preload={index === 0}
                fetchPriority={index === 0 ? "high" : "auto"}
                placeholder="blur"
                blurDataURL={slide.media.blurDataURL}
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-navy/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy/70 via-navy/20 to-transparent" />
      <motion.div className="absolute inset-0 bg-navy" style={{ opacity: veil }} />
      <div className="grain absolute inset-0" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-x relative flex h-full flex-col justify-end pb-28 pt-[calc(var(--header-h)+2rem)] sm:pb-32"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className="eyebrow mb-6 text-deu-sky"
        >
          <span className="h-px w-8 bg-current" /> İzmir · 1982&apos;den beri
        </motion.p>
        <SplitText
          as="h1"
          inView={false}
          delay={0.3}
          stagger={0.07}
          className="display max-w-5xl text-[13vw] sm:text-7xl lg:text-[104px]"
          parts={["Geleceğe yön veren", { text: "eğitim", className: "serif-accent text-deu-sky" }, "ve bilim merkezi."]}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1, ease: EASE }}
          className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <p className="max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            {students} öğrenci, {units} akademik birim ve {centers} araştırma merkeziyle Ege&apos;nin köklü araştırma
            üniversitesi.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Magnetic strength={0.2}>
              <Button href="/akademik" variant="light">
                Programları keşfet
              </Button>
            </Magnetic>
            <VideoButton videoId="ACSpMK66k5E" />
          </div>
        </motion.div>
      </motion.div>

      {/* slide controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute inset-x-0 bottom-0 z-10"
      >
        <div className="container-x flex items-end justify-between gap-6 pb-6">
          <div className="hidden items-center gap-3 text-xs text-white/60 sm:flex">
            <span className="relative flex h-10 w-6 justify-center rounded-full border border-white/30">
              <motion.span
                className="mt-2 h-2 w-0.5 rounded-full bg-white"
                animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
            Keşfetmek için kaydırın
            <ArrowDown className="size-3.5" />
          </div>
          <div className="flex w-full items-end gap-5 sm:w-auto">
            <div className="min-w-0 flex-1 sm:w-80 sm:flex-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                >
                  <Link href={slide.href} className="group block text-right text-xs leading-snug text-white/70">
                    <span className="tabular-nums text-white">
                      {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                    </span>
                    <span className="mt-1 line-clamp-1 transition-colors group-hover:text-white">{slide.caption}</span>
                  </Link>
                </motion.div>
              </AnimatePresence>
              <div className="mt-3 flex gap-1.5">
                {slides.map((s, i) => (
                  <button
                    key={s.media.src}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Görsel ${i + 1}`}
                    aria-current={i === index}
                    className="group relative h-6 flex-1"
                  >
                    <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/25 transition-all group-hover:h-[5px]">
                      {i < index && <span className="absolute inset-0 bg-white" />}
                      {i === index && (
                        <motion.span
                          key={`${index}-${paused}`}
                          className="absolute inset-0 origin-left bg-white"
                          initial={{ scaleX: paused || reduce ? 1 : 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: paused || reduce ? 0 : DURATION / 1000, ease: "linear" }}
                        />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Oynat" : "Durdur"}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-white/25 transition-colors hover:bg-white hover:text-navy"
            >
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
