"use client";

import { ArrowUpRight, BarChart3, FlaskConical, Lightbulb, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/cn";

type Tab = { title: string; blurb: string; links: { text: string; url: string }[] };

const ICONS: Record<string, LucideIcon> = {
  Projeler: FlaskConical,
  "Teknoloji ve İnovasyon": Lightbulb,
  "Bilimsel Faaliyetler": BarChart3,
};

/** Vertical tab list with an animated indicator and a cross-fading link panel. */
export function ResearchTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  const tab = tabs[active];

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div role="tablist" aria-orientation="vertical" className="flex gap-2 overflow-x-auto lg:col-span-4 lg:flex-col">
        {tabs.map((t, i) => {
          const Icon = ICONS[t.title] ?? FlaskConical;
          const on = i === active;
          return (
            <button
              key={t.title}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "relative flex shrink-0 items-center gap-4 rounded-3xl p-5 text-left transition-colors",
                on ? "text-white" : "hover:bg-white",
              )}
            >
              {on && (
                <motion.span
                  layoutId="research-tab"
                  className="absolute inset-0 rounded-3xl bg-deu"
                  transition={{ type: "spring", stiffness: 350, damping: 32 }}
                />
              )}
              <span
                className={cn(
                  "relative grid size-12 place-items-center rounded-2xl transition-colors",
                  on ? "bg-white/15" : "bg-deu-mist text-deu",
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className="relative">
                <span className="block text-lg font-semibold">{t.title}</span>
                <span className={cn("text-sm", on ? "text-white/70" : "text-ink/50")}>{t.links.length} kaynak</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative min-h-[340px] overflow-hidden rounded-[2rem] bg-white p-8 sm:p-10 lg:col-span-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab.title}
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-serif text-3xl leading-snug">{tab.blurb}</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {tab.links.map((l, i) => (
                <motion.li
                  key={l.url}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex h-full items-center justify-between gap-4 rounded-2xl border border-line p-5 transition-all duration-300 hover:border-deu hover:bg-deu-mist"
                  >
                    <span className="font-semibold leading-snug transition-colors group-hover:text-deu">{l.text}</span>
                    <ArrowUpRight className="size-4 shrink-0 text-deu transition-transform duration-300 group-hover:rotate-45" />
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
