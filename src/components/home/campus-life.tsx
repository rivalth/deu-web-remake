"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Media } from "@/lib/media";
import { cn } from "@/lib/cn";

export type Moment = { media: Media; title: string; href: string; tag: string };

const SHAPES = [
  "h-[62vh] w-[44vh]",
  "h-[46vh] w-[64vh] self-end",
  "h-[56vh] w-[40vh] self-start",
  "h-[66vh] w-[52vh]",
  "h-[44vh] w-[60vh] self-end",
  "h-[58vh] w-[42vh] self-start",
  "h-[50vh] w-[70vh]",
  "h-[60vh] w-[44vh] self-end",
];

/** Vertical scroll drives a horizontal photo reel while the section is pinned. */
export function CampusLife({ moments }: { moments: Moment[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const titleX = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const counter = useTransform(scrollYProgress, (v) => String(Math.min(moments.length, Math.floor(v * moments.length) + 1)).padStart(2, "0"));

  if (reduce) {
    return (
      <section className="bg-navy py-24 text-white">
        <div className="container-x">
          <h2 className="display text-5xl">Kampüste hayat</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {moments.map((m) => (
              <MomentCard key={m.href + m.media.src} m={m} className="aspect-[4/5] w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={section} className="relative bg-navy text-white" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="grain sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.p
          style={{ x: titleX }}
          aria-hidden
          className="pointer-events-none absolute left-0 top-[calc(var(--header-h)+1rem)] whitespace-nowrap text-[18vw] font-semibold leading-none tracking-[-0.05em] text-white/[0.04]"
        >
          Kampüste hayat · Kampüste hayat
        </motion.p>
        <motion.div ref={track} style={{ x }} className="flex h-[72vh] w-max items-center gap-8 pl-4 pr-[10vw] sm:pl-10">
          <div className="flex h-full w-[min(80vw,440px)] shrink-0 flex-col justify-center pr-6">
            <p className="eyebrow text-deu-sky">
              <span className="h-px w-8 bg-current" /> Kampüste hayat
            </p>
            <h2 className="display mt-6 text-5xl sm:text-6xl">
              Öğrenmenin <span className="serif-accent text-deu-sky">her</span> anı.
            </h2>
            <p className="mt-6 max-w-sm text-white/65">
              Mezuniyet coşkusundan konservatuvar sahnesine, ilk dersten uluslararası kongrelere: Dokuz Eylül&apos;de bir
              yıl.
            </p>
            <p className="mt-10 font-serif text-6xl italic text-white/90">
              <motion.span>{counter}</motion.span>
              <span className="text-2xl text-white/40"> / {String(moments.length).padStart(2, "0")}</span>
            </p>
          </div>
          {moments.map((m, i) => (
            <MomentCard key={m.href + m.media.src} m={m} className={SHAPES[i % SHAPES.length]} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function MomentCard({ m, className }: { m: Moment; className?: string }) {
  return (
    <Link href={m.href} className={cn("group relative block shrink-0 overflow-hidden rounded-[2rem]", className)}>
      <Image
        src={m.media.src}
        alt={m.title}
        fill
        sizes="(min-width: 768px) 50vh, 80vw"
        placeholder="blur"
        blurDataURL={m.media.blurDataURL}
        className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
      <span className="absolute left-5 top-5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] backdrop-blur-md">
        {m.tag}
      </span>
      <p className="absolute inset-x-5 bottom-5 translate-y-2 text-lg font-semibold leading-snug transition-transform duration-500 group-hover:translate-y-0">
        {m.title}
      </p>
    </Link>
  );
}
