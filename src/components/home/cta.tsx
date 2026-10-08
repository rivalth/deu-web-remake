"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import type { Media } from "@/lib/media";
import { CANDIDATE_URL } from "@/lib/nav";
import { Magnetic } from "../motion/magnetic";
import { SplitText } from "../motion/split-text";
import { Button } from "../ui/button";

/** Full-bleed photo that opens from an inset card to the full viewport as it scrolls in. */
export function Cta({ media }: { media: Media }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const inset = useTransform(scrollYProgress, [0, 1], [12, 0]);
  const radius = useTransform(scrollYProgress, [0, 1], [48, 0]);
  const clipPath = useTransform([inset, radius] as const, ([i, r]: number[]) => `inset(${i}% ${i}% 0% ${i}% round ${r}px)`);
  const scale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);

  return (
    <section ref={ref} className="relative h-[110vh] min-h-[720px]">
      <motion.div style={{ clipPath }} className="absolute inset-0 overflow-hidden bg-navy">
        <motion.div style={{ scale }} className="absolute inset-0">
          <Image
            src={media.src}
            alt=""
            fill
            sizes="100vw"
            quality={85}
            placeholder="blur"
            blurDataURL={media.blurDataURL}
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-navy/20" />
        <div className="container-x relative flex h-full flex-col items-start justify-end pb-24 text-white">
          <p className="eyebrow text-deu-sky">
            <span className="h-px w-8 bg-current" /> Aday öğrenci
          </p>
          <SplitText
            className="display mt-6 max-w-4xl text-6xl sm:text-8xl"
            parts={["Geleceğini", { text: "Dokuz Eylül'de", className: "serif-accent text-deu-sky" }, "kur."]}
          />
          <p className="mt-6 max-w-lg text-lg text-white/75">
            Tercih döneminde programlar, kampüsler ve öğrenci yaşamı hakkında her şey aday öğrenci portalında.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Magnetic strength={0.25}>
              <Button href={CANDIDATE_URL} variant="light">
                Aday öğrenci portalı
              </Button>
            </Magnetic>
            <Button href="/akademik" variant="ghost-light">
              Akademik birimler
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
