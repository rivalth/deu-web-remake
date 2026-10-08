"use client";

import { ArrowDown } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Media } from "@/lib/media";
import { Magnetic } from "../motion/magnetic";
import { useLenis } from "../site/providers";
import { SplitText } from "../motion/split-text";
import { Button } from "../ui/button";
import { VideoButton } from "./video-modal";

const EASE = [0.16, 1, 0.3, 1] as const;
/** Scroll distance per slide, in svh. */
const STEP = 60;
/** Hold on the first slide before the first transition, in slide units. */
const LEAD = 0.35;
/** Each transition finishes this early in its step, leaving a short hold. */
const HOLD = 0.2;

export type Slide = { media: Media; caption: string; href: string };

/** Scroll range (in slide units) over which slide `i` wipes in. */
const range = (i: number): [number, number] => [LEAD + i - 1, LEAD + i - HOLD];

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
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const ref = useRef<HTMLElement>(null);
  const total = slides.length - 1 + LEAD;

  // pinned phase: scroll position in slide units drives the photo sequence
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const pos = useTransform(scrollYProgress, (v) => v * total);
  useMotionValueEvent(pos, "change", (v) => {
    let next = 0;
    for (let i = 1; i < slides.length; i++) {
      const [s, e] = range(i);
      if (v >= (s + e) / 2) next = i;
    }
    setIndex(next);
  });

  // exit phase: once unpinned, content drifts up and fades, photo zooms
  const { scrollYProgress: exit } = useScroll({ target: ref, offset: ["end end", "end start"] });
  const contentY = useTransform(exit, [0, 1], ["0%", "-35%"]);
  const contentOpacity = useTransform(exit, [0, 0.6], [1, 0]);
  const imageScale = useTransform(exit, [0, 1], [1, 1.15]);
  const veil = useTransform(exit, [0, 1], [0, 0.6]);

  // subtle pointer parallax on the photo layer
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 20 });
  const py = useSpring(my, { stiffness: 60, damping: 20 });

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + ((i === 0 ? 0 : range(i)[1]) / total) * (el.offsetHeight - window.innerHeight);
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const slide = slides[index];

  return (
    <section ref={ref} data-hero className="relative" style={{ height: `calc(100svh + ${total * STEP}svh)` }}>
      <div
        className="sticky top-0 h-[100svh] min-h-[680px] overflow-hidden bg-navy text-white"
        onPointerMove={(e) => {
          if (reduce || e.pointerType !== "mouse") return;
          mx.set((e.clientX / window.innerWidth - 0.5) * -24);
          my.set((e.clientY / window.innerHeight - 0.5) * -16);
        }}
      >
        <motion.div className="absolute inset-[-24px]" style={{ scale: imageScale, x: px, y: py }}>
          {slides.map((s, i) => (
            <Layer key={s.media.src} slide={s} i={i} count={slides.length} pos={pos} reduce={!!reduce} />
          ))}
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

        {/* slide progress, driven by scroll */}
        <motion.div style={{ opacity: contentOpacity }} className="absolute inset-x-0 bottom-0 z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="container-x flex items-end justify-between gap-6 pb-6"
          >
            <div className="hidden items-center gap-3 text-xs text-white/60 sm:flex">
              <span className="relative flex h-10 w-6 justify-center rounded-full border border-white/30">
                <motion.span
                  className="mt-2 h-2 w-0.5 rounded-full bg-white"
                  animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
              </span>
              Kaydırdıkça keşfedin
              <ArrowDown className="size-3.5" />
            </div>
            <div className="w-full sm:w-80">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
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
                    onClick={() => goTo(i)}
                    aria-label={`Görsel ${i + 1}`}
                    aria-current={i === index}
                    className="group relative h-6 flex-1"
                  >
                    <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/25 transition-all group-hover:h-[5px]">
                      <Fill i={i} pos={pos} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/** One photo. Slides after the first wipe up from below as `pos` crosses their range. */
function Layer({
  slide,
  i,
  count,
  pos,
  reduce,
}: {
  slide: Slide;
  i: number;
  count: number;
  pos: MotionValue<number>;
  reduce: boolean;
}) {
  const [s, e] = i === 0 ? [-1, 0] : range(i);
  const t = useTransform(pos, [s, e], [0, 1], { clamp: true });
  // curtain moves up while the photo inside counter-moves, so the image itself stays put
  const outer = useTransform(t, (v) => `${(1 - ease(v)) * 100}%`);
  const inner = useTransform(t, (v) => `${-(1 - ease(v)) * 100}%`);
  const scale = useTransform(t, [0, 1], [1.2, 1.04]);
  // the photo underneath dims as the next one arrives
  const [ns, ne] = i < count - 1 ? range(i + 1) : [99, 100];
  const shade = useTransform(pos, [ns, ne], [0, 0.55], { clamp: true });

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={reduce ? { opacity: t } : { y: i === 0 ? 0 : outer }}
    >
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y: i === 0 ? 0 : inner, scale }}>
        <Image
          src={slide.media.src}
          alt={slide.caption}
          fill
          sizes="100vw"
          quality={75}
          preload={i === 0}
          fetchPriority={i === 0 ? "high" : "low"}
          loading="eager"
          placeholder="blur"
          blurDataURL={slide.media.blurDataURL}
          className="object-cover"
        />
      </motion.div>
      {i < count - 1 && <motion.div className="absolute inset-0 bg-navy" style={{ opacity: shade }} />}
    </motion.div>
  );
}

/** Progress bar segment for slide `i`. */
function Fill({ i, pos }: { i: number; pos: MotionValue<number> }) {
  const [s, e] = i === 0 ? [-1, 0] : range(i);
  const scaleX = useTransform(pos, [s, e], [0, 1], { clamp: true });
  return <motion.span className="absolute inset-0 origin-left bg-white" style={{ scaleX }} />;
}

/** easeInOutCubic */
function ease(v: number) {
  return v < 0.5 ? 4 * v * v * v : 1 - (-2 * v + 2) ** 3 / 2;
}
