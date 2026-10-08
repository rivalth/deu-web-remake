"use client";

import { useLenis } from "lenis/react";
import { ArrowUpRight, LayoutGrid, Menu, Search, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { slugify } from "@/lib/text";
import type { Media } from "@/lib/media";
import { ABOUT_LINKS, CANDIDATE_URL, NAV, RESEARCH_LINKS, type NavItem, type SearchItem } from "@/lib/nav";
import { RollText } from "../ui/button";
import { Logo } from "../ui/logo";
import { CommandMenu } from "./command-menu";

const EASE = [0.16, 1, 0.3, 1] as const;

type Props = {
  quickLinks: { text: string; url: string }[];
  search: SearchItem[];
  unitGroups: { group: string; count: number; sample: string[] }[];
  featured: { title: string; href: string; cover: Media | null };
};

export function Header({ quickLinks, search, unitGroups, featured }: Props) {
  const pathname = usePathname();
  const lenis = useLenis();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mega, setMega] = useState<NavItem["mega"] | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [quick, setQuick] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 420 && y > prev && !mega && !quick);
  });

  // close overlays on navigation
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMega(null);
    setMobile(false);
    setQuick(false);
  }

  // freeze page scroll under full-screen overlays
  useEffect(() => {
    if (mobile || searchOpen) lenis?.stop();
    else lenis?.start();
  }, [mobile, searchOpen, lenis]);

  const overlay = pathname === "/" && !scrolled && !mega && !quick;
  const tone = overlay ? "light" : "dark";

  const openMega = (m: NavItem["mega"] | null) => {
    clearTimeout(closeTimer.current);
    setQuick(false);
    setMega(m ?? null);
  };
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMega(null), 140);
  };

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.5, ease: EASE }}
        className="fixed inset-x-0 top-0 z-40"
        onMouseLeave={scheduleClose}
      >
        <div
          className={cn(
            "relative transition-[background-color,box-shadow,color] duration-500",
            overlay
              ? "bg-transparent text-white"
              : "bg-paper/85 text-ink shadow-[0_1px_0_var(--color-line)] backdrop-blur-xl backdrop-saturate-150",
          )}
        >
          {overlay && (
            <div aria-hidden className="pointer-events-none absolute inset-0 -bottom-16 bg-gradient-to-b from-black/45 to-transparent" />
          )}
          <div className="container-x relative flex h-[var(--header-h)] items-center gap-6">
            <Link href="/" aria-label="Dokuz Eylül Üniversitesi ana sayfa" className="shrink-0 transition-opacity hover:opacity-80">
              <Logo tone={tone} />
            </Link>

            <nav aria-label="Ana menü" className="hidden lg:ml-2 lg:block xl:ml-6" onMouseLeave={() => setHovered(null)}>
              <ul className="flex items-center">
                {NAV.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.href} className="relative">
                      <Link
                        href={item.href}
                        aria-expanded={item.mega ? mega === item.mega : undefined}
                        onMouseEnter={() => {
                          setHovered(item.href);
                          openMega(item.mega ?? null);
                        }}
                        onFocus={() => openMega(item.mega ?? null)}
                        className="group relative block px-3 py-2 text-[14px] font-medium xl:px-4"
                      >
                        {hovered === item.href && (
                          <motion.span
                            layoutId="nav-hover"
                            className={cn("absolute inset-0 rounded-full", tone === "light" ? "bg-white/15" : "bg-ink/[0.06]")}
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          />
                        )}
                        <span className="relative">
                          <RollText>{item.label}</RollText>
                        </span>
                        {active && (
                          <motion.span
                            layoutId="nav-active"
                            className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-current xl:inset-x-4"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className={cn(
                  "group flex h-10 items-center gap-2 rounded-full px-3 text-sm transition-colors md:pr-2",
                  tone === "light" ? "hover:bg-white/15" : "hover:bg-ink/[0.06]",
                )}
                aria-label="Ara"
              >
                <Search className="size-[18px] transition-transform duration-300 group-hover:scale-110" />
                <span className="hidden opacity-70 xl:inline">Ara</span>
                <kbd
                  className={cn(
                    "hidden rounded-md border px-1.5 py-0.5 font-sans text-[11px] md:inline",
                    tone === "light" ? "border-white/25" : "border-ink/15",
                  )}
                >
                  ⌘K
                </kbd>
              </button>

              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => {
                    setMega(null);
                    setQuick((q) => !q);
                  }}
                  aria-expanded={quick}
                  className={cn(
                    "group flex h-10 items-center gap-2 rounded-full px-3 text-sm transition-colors",
                    tone === "light" ? "hover:bg-white/15" : "hover:bg-ink/[0.06]",
                    quick && "bg-ink/[0.06]",
                  )}
                >
                  <LayoutGrid className="size-[18px] transition-transform duration-500 group-hover:rotate-90" />
                  <span className="hidden whitespace-nowrap xl:inline">Hızlı erişim</span>
                </button>
                <AnimatePresence>
                  {quick && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="absolute right-0 top-[calc(100%+12px)] w-[420px] origin-top-right rounded-3xl border border-line bg-white p-3 text-ink shadow-2xl shadow-navy/15"
                    >
                      <p className="eyebrow px-3 pb-2 pt-1 text-ink/50">Sık kullanılanlar</p>
                      <div className="grid grid-cols-2 gap-1">
                        {quickLinks.map((l, i) => (
                          <motion.a
                            key={l.url}
                            href={l.url}
                            target="_blank"
                            rel="noreferrer"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.03 * i, duration: 0.3 }}
                            className="group flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-deu-mist hover:text-deu"
                          >
                            {l.text}
                            <ArrowUpRight className="size-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                          </motion.a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <a
                href={CANDIDATE_URL}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "group ml-2 hidden h-10 items-center gap-2 whitespace-nowrap rounded-full px-5 text-sm font-semibold transition-colors sm:inline-flex",
                  tone === "light" ? "bg-white text-deu hover:bg-deu-mist" : "bg-deu text-white hover:bg-navy",
                )}
              >
                <RollText>Aday Öğrenci</RollText>
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
              </a>

              <button
                type="button"
                onClick={() => setMobile(true)}
                aria-label="Menüyü aç"
                className={cn(
                  "grid size-10 place-items-center rounded-full lg:hidden",
                  tone === "light" ? "hover:bg-white/15" : "hover:bg-ink/[0.06]",
                )}
              >
                <Menu className="size-5" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mega && (
              <motion.div
                key="mega"
                initial={{ clipPath: "inset(0 0 100% 0)" }}
                animate={{ clipPath: "inset(0 0 0% 0)" }}
                exit={{ clipPath: "inset(0 0 100% 0)" }}
                transition={{ duration: 0.45, ease: EASE }}
                onMouseEnter={() => clearTimeout(closeTimer.current)}
                className="absolute inset-x-0 top-full hidden border-t border-line bg-paper text-ink shadow-[0_30px_60px_-30px_rgb(3_24_44/0.35)] lg:block"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mega}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="container-x grid grid-cols-12 gap-10 py-10"
                  >
                    {mega === "about" && <MegaLinks title="Üniversitemiz" links={ABOUT_LINKS} featured={featured} />}
                    {mega === "research" && <MegaLinks title="Araştırma" links={RESEARCH_LINKS} featured={featured} />}
                    {mega === "academic" && <MegaAcademic groups={unitGroups} />}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <AnimatePresence>
        {mega && (
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 hidden bg-navy/30 backdrop-blur-[2px] lg:block"
            onMouseEnter={() => setMega(null)}
          />
        )}
      </AnimatePresence>

      <MobileMenu open={mobile} onClose={() => setMobile(false)} quickLinks={quickLinks} />
      <CommandMenu open={searchOpen} setOpen={setSearchOpen} items={search} />
    </>
  );
}

function MegaLinks({
  title,
  links,
  featured,
}: {
  title: string;
  links: { label: string; href: string; hint: string }[];
  featured: Props["featured"];
}) {
  return (
    <>
      <div className="col-span-3">
        <p className="eyebrow text-deu">{title}</p>
        <p className="mt-4 max-w-[16rem] font-serif text-3xl leading-tight text-ink">
          Eğitim, bilim ve <em>yenilikçilik</em> 1982&apos;den beri İzmir&apos;de.
        </p>
      </div>
      <ul className="col-span-6 grid grid-cols-2 gap-x-6 gap-y-1">
        {links.map((l, i) => (
          <motion.li
            key={l.href}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.04 * i + 0.1, duration: 0.4, ease: EASE }}
          >
            <Link
              href={l.href}
              {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
              className="group flex items-start justify-between gap-4 rounded-2xl p-4 transition-colors hover:bg-white"
            >
              <span>
                <span className="block text-[15px] font-semibold transition-colors group-hover:text-deu">{l.label}</span>
                <span className="mt-0.5 block text-sm text-ink/55">{l.hint}</span>
              </span>
              <ArrowUpRight className="mt-0.5 size-4 shrink-0 -translate-x-1 text-deu opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          </motion.li>
        ))}
      </ul>
      <Link href={featured.href} className="group col-span-3 block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-paper-deep">
          {featured.cover && (
            <Image
              src={featured.cover.src}
              alt=""
              fill
              sizes="320px"
              placeholder="blur"
              blurDataURL={featured.cover.blurDataURL}
              className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
            />
          )}
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-deu backdrop-blur">
            Son haber
          </span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-deu">{featured.title}</p>
      </Link>
    </>
  );
}

function MegaAcademic({ groups }: { groups: Props["unitGroups"] }) {
  return (
    <>
      <div className="col-span-3">
        <p className="eyebrow text-deu">Akademik birimler</p>
        <p className="mt-4 max-w-[16rem] font-serif text-3xl leading-tight">
          {groups.reduce((a, g) => a + g.count, 0)} birim, <em>tek bir</em> üniversite.
        </p>
        <Link href="/akademik" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-deu">
          <span className="link-underline">Tüm birimleri keşfet</span>
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
      <div className="col-span-9 grid grid-cols-4 gap-3">
        {groups.map((g, i) => (
          <motion.div
            key={g.group}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i + 0.1, duration: 0.45, ease: EASE }}
          >
            <Link
              href={`/akademik#${slugify(g.group)}`}
              className="group flex h-full flex-col rounded-2xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-deu/30 hover:shadow-xl hover:shadow-deu/10"
            >
              <span className="text-4xl font-semibold tracking-tight text-deu">{g.count}</span>
              <span className="mt-1 text-[15px] font-semibold">{g.group}</span>
              <span className="mt-3 line-clamp-3 text-xs leading-relaxed text-ink/55">{g.sample.join(" · ")}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </>
  );
}

function MobileMenu({
  open,
  onClose,
  quickLinks,
}: {
  open: boolean;
  onClose: () => void;
  quickLinks: Props["quickLinks"];
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ clipPath: "circle(0% at calc(100% - 40px) 38px)" }}
          animate={{ clipPath: "circle(150% at calc(100% - 40px) 38px)" }}
          exit={{ clipPath: "circle(0% at calc(100% - 40px) 38px)" }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          className="grain fixed inset-0 z-50 flex flex-col overflow-y-auto bg-navy text-white"
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-label="Menü"
        >
          <div className="container-x flex h-[var(--header-h)] shrink-0 items-center justify-between">
            <Logo tone="light" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Menüyü kapat"
              className="grid size-10 place-items-center rounded-full bg-white/10 transition-transform hover:rotate-90"
            >
              <X className="size-5" />
            </button>
          </div>
          <nav className="container-x mt-6 flex-1">
            <ul>
              {[{ label: "Ana sayfa", href: "/" }, ...NAV, { label: "Sayılarla DEÜ", href: "/sayilarla" }].map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.05, duration: 0.6, ease: EASE }}
                  className="border-b border-white/10"
                >
                  <Link href={item.href} onClick={onClose} className="group flex items-center justify-between py-4 text-3xl font-semibold tracking-tight">
                    {item.label}
                    <ArrowUpRight className="size-6 text-deu-sky transition-transform group-hover:rotate-45" />
                  </Link>
                </motion.li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-10 pb-10"
            >
              <p className="eyebrow text-white/50">Hızlı erişim</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {quickLinks.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/15 px-4 py-2 text-sm transition-colors hover:bg-white hover:text-navy"
                  >
                    {l.text}
                  </a>
                ))}
              </div>
              <a
                href={CANDIDATE_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-8 flex items-center justify-between rounded-3xl bg-white p-6 text-navy"
              >
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-deu">Aday öğrenci</span>
                  <span className="mt-1 block text-xl font-semibold">Geleceğini DEÜ&apos;de kur</span>
                </span>
                <ArrowUpRight className="size-6 text-deu" />
              </a>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
