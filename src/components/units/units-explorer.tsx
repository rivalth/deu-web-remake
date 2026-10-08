"use client";

import { Search, X } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type { Unit, UnitGroup } from "@/lib/content";
import { cn } from "@/lib/cn";
import { slugify } from "@/lib/text";
import { UnitCard } from "./unit-card";

const fold = (s: string) => slugify(s).replace(/-/g, " ");

export function UnitsExplorer({
  units,
  groups,
  limit,
  syncHash = false,
}: {
  units: Unit[];
  groups: UnitGroup[];
  limit?: number;
  syncHash?: boolean;
}) {
  const [group, setGroup] = useState<UnitGroup | "Tümü">(limit ? groups[0] : "Tümü");
  const [query, setQuery] = useState("");

  // /akademik#fakulteler selects a tab
  useEffect(() => {
    if (!syncHash) return;
    const apply = () => {
      const g = groups.find((x) => slugify(x) === decodeURIComponent(location.hash.slice(1)));
      if (g) setGroup(g);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [groups, syncHash]);

  const tabs: (UnitGroup | "Tümü")[] = limit ? groups : ["Tümü", ...groups];
  const list = useMemo(() => {
    const q = fold(query);
    return units.filter((u) => (group === "Tümü" || u.group === group) && (!q || fold(u.name).includes(q)));
  }, [units, group, query]);
  const shown = limit ? list.slice(0, limit) : list;

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <LayoutGroup id={limit ? "units-home" : "units-page"}>
          <div role="tablist" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
            {tabs.map((t) => {
              const count = t === "Tümü" ? units.length : units.filter((u) => u.group === t).length;
              const active = t === group;
              return (
                <button
                  key={t}
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setGroup(t);
                    if (syncHash) history.replaceState(null, "", t === "Tümü" ? location.pathname : `#${slugify(t)}`);
                  }}
                  className={cn(
                    "relative shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                    active ? "text-white" : "text-ink/70 hover:text-ink",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="unit-tab"
                      className="absolute inset-0 rounded-full bg-deu"
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  )}
                  <span className="relative">
                    {t}
                    <span className={cn("ml-2 text-xs tabular-nums", active ? "text-white/70" : "text-ink/65")}>{count}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
        <label className="group relative flex h-12 items-center rounded-full border border-line bg-white pl-4 pr-2 transition-[border-color,box-shadow] focus-within:border-deu/40 focus-within:shadow-lg focus-within:shadow-deu/10 md:w-80">
          <Search className="size-4 text-ink/65 transition-colors group-focus-within:text-deu" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Birim ara…"
            className="h-full flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-ink/65"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                type="button"
                onClick={() => setQuery("")}
                aria-label="Aramayı temizle"
                className="grid size-8 place-items-center rounded-full bg-paper"
              >
                <X className="size-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </label>
      </div>

      <motion.div layout className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {shown.map((u, i) => (
            <UnitCard key={u.slug} unit={u} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {shown.length === 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-16 text-center text-ink/70">
            “{query}” için birim bulunamadı.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
