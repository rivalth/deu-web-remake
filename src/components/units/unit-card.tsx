"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import type { Unit } from "@/lib/content";
import { Logotype } from "../ui/logo";

export function UnitCard({ unit, index = 0 }: { unit: Unit; index?: number }) {
  const short = unit.name.replace(/ (Fakültesi|Enstitüsü|Meslek Yüksekokulu|Yüksekokulu)$/, "");
  const kind = unit.name.slice(short.length).trim() || unit.group;
  return (
    <motion.a
      layout
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: Math.min(index, 12) * 0.025 }}
      href={unit.url}
      target="_blank"
      rel="noreferrer"
      className="group relative flex min-h-48 flex-col justify-between overflow-hidden rounded-3xl border border-line bg-white p-6 transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-1 hover:border-deu/25 hover:shadow-2xl hover:shadow-deu/10"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-0 bg-deu transition-[height] duration-500 ease-[var(--ease-out-expo)] group-hover:h-1"
      />
      <div className="flex items-start justify-between">
        <span className="grid size-20 place-items-center overflow-hidden rounded-2xl bg-paper p-2 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-105">
          {unit.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={unit.logo} alt="" loading="lazy" className="size-full object-contain" />
          ) : (
            <Logotype className="w-10 text-deu" />
          )}
        </span>
        <span className="grid size-9 place-items-center rounded-full border border-line text-ink/50 transition-all duration-500 group-hover:rotate-45 group-hover:border-deu group-hover:bg-deu group-hover:text-white">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className="mt-6">
        <p className="text-lg font-semibold leading-tight tracking-tight transition-colors group-hover:text-deu">{short}</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-ink/45">{kind}</p>
      </div>
    </motion.a>
  );
}
