"use client";

import { Search } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { NewsItem } from "@/lib/content";
import { cn } from "@/lib/cn";
import { slugify } from "@/lib/text";
import { NewsCard } from "./news-card";

type Item = Pick<NewsItem, "slug" | "title" | "date" | "categories" | "cover" | "excerpt">;

const monthFmt = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric", timeZone: "Europe/Istanbul" });
const fold = (s: string) => slugify(s).replace(/-/g, " ");

export function NewsBrowser({ items }: { items: Item[] }) {
  const months = useMemo(() => [...new Set(items.map((n) => monthFmt.format(new Date(n.date))))], [items]);
  const [month, setMonth] = useState<string>("Tümü");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(13);

  const list = useMemo(() => {
    const q = fold(query);
    return items.filter(
      (n) =>
        (month === "Tümü" || monthFmt.format(new Date(n.date)) === month) &&
        (!q || fold(n.title + " " + n.excerpt).includes(q)),
    );
  }, [items, month, query]);
  const shown = list.slice(0, visible);

  return (
    <div>
      <div className="sticky top-[calc(var(--header-h)+0.75rem)] z-20 -mx-2 flex flex-col gap-3 rounded-full px-2 py-2 md:flex-row md:items-center md:justify-between">
        <LayoutGroup id="news-months">
          <div className="flex gap-1 overflow-x-auto rounded-full border border-line bg-white/80 p-1 backdrop-blur-xl">
            {["Tümü", ...months].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMonth(m);
                  setVisible(13);
                }}
                className={cn(
                  "relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors",
                  m === month ? "text-white" : "text-ink/60 hover:text-ink",
                )}
              >
                {m === month && (
                  <motion.span layoutId="month-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                )}
                <span className="relative">{m}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>
        <label className="flex h-12 items-center gap-2 rounded-full border border-line bg-white/80 px-4 backdrop-blur-xl transition-shadow focus-within:shadow-lg focus-within:shadow-deu/10 md:w-72">
          <Search className="size-4 text-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Haberlerde ara…"
            className="h-full flex-1 bg-transparent text-sm outline-none focus-visible:outline-none"
          />
        </label>
      </div>

      <motion.div layout className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((n, i) => (
            <motion.div
              key={n.slug}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: (i % 6) * 0.04 }}
              className={i === 0 && month === "Tümü" && !query ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : ""}
            >
              <NewsCard item={n} size={i === 0 && month === "Tümü" && !query ? "lg" : "md"} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {list.length === 0 && <p className="py-20 text-center text-ink/50">Aramanızla eşleşen haber yok.</p>}
      {visible < list.length && (
        <div className="mt-16 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + 9)}
            className="group inline-flex h-14 items-center gap-3 rounded-full border border-ink/15 px-8 text-sm font-semibold transition-all hover:border-deu hover:bg-deu hover:text-white active:scale-95"
          >
            Daha fazla göster
            <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs tabular-nums transition-colors group-hover:bg-white/20">
              {list.length - visible}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
