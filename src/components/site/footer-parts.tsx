"use client";

import { useLenis } from "lenis/react";
import { ArrowUp } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Magnetic } from "../motion/magnetic";
import { Logotype } from "../ui/logo";

/** Giant DEÜ mark that rises out of the footer as you reach the bottom. */
export function FooterMark() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["45%", "0%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.2, 1]);
  return (
    <div ref={ref} className="container-x pointer-events-none relative overflow-hidden" aria-hidden>
      <motion.div style={{ y, opacity }} className="-mb-[12%]">
        <Logotype className="w-full text-white/[0.06]" />
      </motion.div>
    </div>
  );
}

export function BackToTop() {
  const lenis = useLenis();
  return (
    <Magnetic>
      <button
        type="button"
        onClick={() => (lenis ? lenis.scrollTo(0, { duration: 1.6 }) : window.scrollTo({ top: 0, behavior: "smooth" }))}
        className="group grid size-14 place-items-center rounded-full border border-white/20 transition-colors hover:bg-white hover:text-navy"
        aria-label="Yukarı çık"
      >
        <ArrowUp className="size-5 transition-transform duration-500 group-hover:-translate-y-1" />
      </button>
    </Magnetic>
  );
}
