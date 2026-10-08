"use client";

import { motion } from "motion/react";
import { Spotlight } from "../motion/spotlight";

/** Core values as a grid; hovering a tile floods it with brand blue. */
export function ValuesGrid({ values }: { values: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-5">
      {values.map((v, i) => (
        <motion.div
          key={v}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, duration: 0.6 }}
        >
          <Spotlight className="h-full bg-navy">
            <div className="group relative flex aspect-square flex-col justify-between p-6">
              <span className="absolute inset-0 origin-bottom scale-y-0 bg-deu transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-y-100" />
              <span className="relative font-serif text-xl italic text-deu-sky transition-colors group-hover:text-white/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="relative text-xl font-semibold tracking-tight transition-transform duration-500 group-hover:-translate-y-1 sm:text-2xl">
                {v}
              </span>
            </div>
          </Spotlight>
        </motion.div>
      ))}
    </div>
  );
}
