"use client";

import { Command } from "cmdk";
import { ArrowUpRight, Building2, CornerDownLeft, FileText, Megaphone, Newspaper, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type ComponentType } from "react";
import type { SearchItem } from "@/lib/nav";

const ICONS: Record<SearchItem["group"], ComponentType<{ className?: string }>> = {
  Sayfalar: FileText,
  "Akademik birimler": Building2,
  Haberler: Newspaper,
  Duyurular: Megaphone,
};

const GROUPS: SearchItem["group"][] = ["Sayfalar", "Akademik birimler", "Haberler", "Duyurular"];

// cmdk matches on `value`; fold Turkish characters so "muhendislik" finds "Mühendislik"
const fold = (s: string) =>
  s
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]/g, (c) => ({ ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" })[c] ?? c);

export function CommandMenu({
  open,
  setOpen,
  items,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  items: SearchItem[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA)$/.test(e.target.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const go = (href: string) => {
    setOpen(false);
    if (href.startsWith("http")) window.open(href, "_blank", "noreferrer");
    else router.push(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-navy/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Sitede ara"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-navy/30"
            onAnimationComplete={() => inputRef.current?.focus()}
          >
            <Command label="Sitede ara" filter={(value, search) => (fold(value).includes(fold(search)) ? 1 : 0)}>
              <div className="flex items-center gap-3 border-b border-line px-5">
                <Search className="size-5 text-deu" />
                <Command.Input
                  ref={inputRef}
                  autoFocus
                  placeholder="Fakülte, haber, duyuru ara…"
                  className="h-16 flex-1 bg-transparent text-lg outline-none placeholder:text-ink/35 focus-visible:outline-none"
                />
                <kbd className="rounded-md border border-line px-2 py-1 text-[11px] text-ink/50">ESC</kbd>
              </div>
              <Command.List className="max-h-[55vh] overflow-y-auto overscroll-contain p-2" data-lenis-prevent>
                <Command.Empty className="px-4 py-12 text-center text-sm text-ink/50">
                  Sonuç bulunamadı. Farklı bir kelime deneyin.
                </Command.Empty>
                {GROUPS.map((group) => {
                  const Icon = ICONS[group];
                  return (
                    <Command.Group
                      key={group}
                      heading={group}
                      className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.22em] [&_[cmdk-group-heading]]:text-ink/40"
                    >
                      {items
                        .filter((i) => i.group === group)
                        .map((item) => (
                          <Command.Item
                            key={item.href + item.title}
                            value={`${item.title} ${item.hint ?? ""} ${item.href}`}
                            onSelect={() => go(item.href)}
                            className="group flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-[15px] data-[selected=true]:bg-deu-mist data-[selected=true]:text-deu"
                          >
                            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-paper text-deu transition-colors group-data-[selected=true]:bg-white">
                              <Icon className="size-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium">{item.title}</span>
                              {item.hint && <span className="block truncate text-xs text-ink/45">{item.hint}</span>}
                            </span>
                            {item.href.startsWith("http") ? (
                              <ArrowUpRight className="size-4 opacity-0 group-data-[selected=true]:opacity-100" />
                            ) : (
                              <CornerDownLeft className="size-4 opacity-0 group-data-[selected=true]:opacity-100" />
                            )}
                          </Command.Item>
                        ))}
                    </Command.Group>
                  );
                })}
              </Command.List>
              <div className="flex items-center justify-between border-t border-line px-5 py-3 text-xs text-ink/45">
                <span>↑↓ gezin · ↵ aç</span>
                <span>
                  <kbd className="font-sans">/</kbd> veya <kbd className="font-sans">⌘K</kbd> ile her yerden açın
                </span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
