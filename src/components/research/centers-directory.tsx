"use client";

import { ArrowUpRight, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { slugify } from "@/lib/text";

type Center = { text: string; url: string | null };

const TOPICS: { label: string; match: RegExp }[] = [
  { label: "Sağlık", match: /sağlık|tıp|diş|hastal|kalp|klinik|kozmetoloji|sporcu|enfeksiyon/i },
  { label: "Mühendislik & Teknoloji", match: /teknoloji|bilişim|enerji|elektronik|deprem|su kaynak|sanayi|malzeme/i },
  { label: "Toplum & Kültür", match: /kültür|tarih|türk|mevlana|köy|kadın|aile|hukuk|stratejik|avrupa|arkeo/i },
  { label: "Eğitim", match: /eğitim|dil|gelişim|rehberlik|çocuk/i },
  { label: "Çevre & Doğa", match: /çevre|fauna|flora|deniz|sualtı|ege/i },
];

const fold = (s: string) => slugify(s).replace(/-/g, " ");

export function CentersDirectory({ centers }: { centers: Center[] }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string | null>(null);

  const list = useMemo(() => {
    const q = fold(query);
    const t = TOPICS.find((x) => x.label === topic);
    return centers
      .filter((c) => (!q || fold(c.text).includes(q)) && (!t || t.match.test(c.text)))
      .sort((a, b) => a.text.localeCompare(b.text, "tr"));
  }, [centers, query, topic]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setTopic((x) => (x === t.label ? null : t.label))}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 active:scale-95",
                topic === t.label ? "border-deu bg-deu text-white" : "border-line hover:border-ink/30",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <label className="flex h-12 items-center gap-2 rounded-full border border-line bg-white px-4 transition-shadow focus-within:shadow-lg focus-within:shadow-deu/10 lg:w-80">
          <Search className="size-4 text-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Merkez ara…"
            className="h-full flex-1 bg-transparent text-sm outline-none focus-visible:outline-none"
          />
        </label>
      </div>

      <p className="mt-6 text-sm text-ink/45">
        <motion.span key={list.length} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="inline-block font-semibold text-deu">
          {list.length}
        </motion.span>{" "}
        merkez listeleniyor
      </p>

      <motion.ul layout className="mt-6 grid border-t border-line md:grid-cols-2 md:gap-x-10">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((c) => {
            const Inner = (
              <>
                <span className="font-medium leading-snug transition-colors group-hover:text-deu">{c.text}</span>
                {c.url && (
                  <ArrowUpRight className="size-4 shrink-0 -translate-x-2 text-deu opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                )}
              </>
            );
            return (
              <motion.li
                key={c.text}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="border-b border-line"
              >
                {c.url ? (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between gap-4 py-4 transition-[padding] duration-300 hover:pl-2"
                  >
                    {Inner}
                  </a>
                ) : (
                  <span className="group flex items-center justify-between gap-4 py-4 text-ink/70">{Inner}</span>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
