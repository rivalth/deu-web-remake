"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import type { Media } from "@/lib/media";
import { ArrowLink } from "../ui/button";

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <span className="relative mr-[0.25em] inline-block">
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
}

/** Mission statement whose words light up as it scrolls through the viewport. */
export function Mission({ text, images }: { text: string; images: Media[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");

  const section = useRef<HTMLElement>(null);
  const { scrollYProgress: sp } = useScroll({ target: section, offset: ["start end", "end start"] });
  const y1 = useTransform(sp, [0, 1], [80, -80]);
  const y2 = useTransform(sp, [0, 1], [160, -120]);
  const rotate = useTransform(sp, [0, 1], [-4, 3]);

  return (
    <section ref={section} className="relative overflow-hidden py-28 sm:py-40">
      <div className="container-x grid gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <p className="eyebrow text-deu">
            <span className="h-px w-8 bg-current" /> Misyonumuz
          </p>
          <div ref={ref} className="mt-8">
            <p className="text-3xl font-medium leading-[1.2] tracking-tight text-ink sm:text-5xl">
              {words.map((w, i) => (
                <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
                  {w}
                </Word>
              ))}
            </p>
          </div>
          <div className="mt-12 grid max-w-xl gap-8 sm:grid-cols-2">
            <div>
              <p className="eyebrow text-ink/45">Vizyonumuz</p>
              <p className="mt-3 font-serif text-2xl leading-snug">
                Girişimcilik ve yenilikçilik alanında geleceğe yön veren; eğitim ve bilim merkezi bir üniversite olmak.
              </p>
            </div>
            <div className="flex items-end">
              <ArrowLink href="/hakkimizda" className="text-deu">
                Üniversitemizi tanıyın
              </ArrowLink>
            </div>
          </div>
        </div>

        <div className="relative h-[520px] lg:col-span-5 lg:h-auto">
          {images[0] && (
            <motion.div
              style={{ y: y1 }}
              className="absolute right-0 top-0 aspect-[4/5] w-[78%] overflow-hidden rounded-[2rem] shadow-2xl shadow-navy/20"
            >
              <Image
                src={images[0].src}
                alt={images[0].alt ?? ""}
                fill
                sizes="(min-width: 1024px) 32vw, 80vw"
                placeholder="blur"
                blurDataURL={images[0].blurDataURL}
                className="object-cover"
              />
            </motion.div>
          )}
          {images[1] && (
            <motion.div
              style={{ y: y2, rotate }}
              className="absolute bottom-0 left-0 aspect-[4/3] w-[58%] overflow-hidden rounded-[1.5rem] border-[6px] border-paper shadow-2xl shadow-navy/25"
            >
              <Image
                src={images[1].src}
                alt={images[1].alt ?? ""}
                fill
                sizes="(min-width: 1024px) 24vw, 60vw"
                placeholder="blur"
                blurDataURL={images[1].blurDataURL}
                className="object-cover"
              />
            </motion.div>
          )}
          <motion.div
            style={{ y: y1 }}
            className="absolute -left-2 top-16 hidden rounded-full bg-deu px-5 py-3 text-sm font-semibold text-white shadow-xl sm:block"
          >
            <span className="font-serif text-2xl italic">44</span> yıllık birikim
          </motion.div>
        </div>
      </div>
    </section>
  );
}
