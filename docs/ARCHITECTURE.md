# Architecture

This document explains how the site is put together and why the main decisions were made. For setup, see the [README](../README.md).

- [Overview](#overview)
- [Content pipeline](#content-pipeline)
- [Rendering](#rendering)
- [Search](#search)
- [Motion system](#motion-system)
- [Performance](#performance)
- [Accessibility](#accessibility)
- [Brand](#brand)

## Overview

```
 deu.edu.tr, haber.deu.edu.tr (RSS),          kurumsalkimlik.deu.edu.tr
 sayilarla.deu.edu.tr                                   │
          │                                             │ (manual download)
          ▼  scripts/scrape_deu.py                      ▼
 ┌──────────────────────────────┐            ┌─────────────────────┐
 │ content/                     │            │ brand/              │
 │  pages/*.md  news/*.md       │            │  logos, guide pages │
 │  announcements/*.md          │            │  tokens.json        │
 │  stats/*.md  site.json       │            └─────────┬───────────┘
 │  images/**                   │                      │ unit logos
 └──────────────┬───────────────┘                      │
                │  scripts/sync-media.mjs  ◄───────────┘
                ▼
 public/images, public/units, public/fonts
 src/generated/media.json   (width, height, blur placeholder per image)
                │
                ▼  src/lib/content.ts (sync fs reads at build time)
 Next.js App Router → 92 prerendered pages → Netlify
```

Nothing is fetched from DEÜ at request time. The site is a static snapshot of the archive in `content/`, so it is fast and keeps working whatever happens upstream.

## Content pipeline

### Scraping (`scripts/scrape_deu.py`)

A single-file Python script with [inline dependencies](https://peps.python.org/pep-0723/), run with `uv run`. It has one section per source (`home`, `pages`, `news`, `announcements`, `stats`) that can be run on its own with `--only`.

- **News** come from the RSS feed and are followed to the full article. WordPress thumbnails (`photo-357x210.jpg`) are upgraded to the original upload by removing the `-WxH` suffix, falling back to the thumbnail if the original is missing.
- **Statistics** tables are parsed into JSON and embedded in the Markdown frontmatter.
- **Images** are downscaled to at most 1600px, re-encoded and named with a short hash of their source URL, so re-running the scraper doesn't duplicate files.
- Output is Markdown with **JSON-valued frontmatter** (`title: "…"`, `images: [...]`). Every value is valid JSON, so the loader needs no YAML parser.

### Media sync (`scripts/sync-media.mjs`)

Runs before `dev` and `build`. It:

1. copies `content/images` to `public/images` and records each image's width, height and a 12px WebP blur placeholder in `src/generated/media.json`;
2. resizes the unit logos from `brand/logos/units` to 160px WebP in `public/units`;
3. copies the woff2 font files from `node_modules` to `public/fonts` under stable URLs so they can be preloaded.

Files are only rewritten when the source is newer. Everything it produces is gitignored.

### Loading (`src/lib/content.ts`)

Plain synchronous `fs` reads. With Cache Components enabled, synchronous I/O in a server component runs at build time and its output is prerendered, so the helpers stay simple (`getNews()`, `getUnits()`, `getStats()`…) and no request ever touches the filesystem. `media(path)` turns a content path into `{ src, width, height, blurDataURL }` for `next/image`.

`next.config.ts` lists `content/**` in `outputFileTracingIncludes` so the archive is bundled into the server function on Netlify as well.

## Rendering

- **Next.js 16 App Router** with `cacheComponents` and `partialPrefetching`.
- **Dynamic routes** (`/haberler/[slug]`, `/duyurular/[slug]`) use `generateStaticParams`, so every article is prerendered. The page awaits `params` inside a `<Suspense>` boundary with a skeleton fallback, which keeps client-side navigation instant.
- **Overlays** (search, video, image lightbox) render through a small `Portal` into `document.body`. The hero and other sections use transforms, and a transformed ancestor would otherwise trap `position: fixed` and stacking order under the header.
- **Page transitions** live in `app/template.tsx`, which remounts on every navigation. The fade is skipped on the very first load; see [Performance](#performance).

## Search

The root layout builds a small index (pages, units, news, announcements) on the server and passes it to the header. The command palette ([cmdk](https://cmdk.paco.me)) opens with ⌘K / Ctrl K or `/`. Matching uses a custom filter that folds Turkish characters (ç→c, ğ→g, ı/İ→i, ö→o, ş→s, ü→u) and lowercases with Turkish rules, so `muhendislik` finds *Mühendislik Fakültesi*.

## Motion system

Reusable primitives live in `src/components/motion/`:

| Primitive | Used for |
| --- | --- |
| `Reveal`, `Stagger` | Fade-and-lift when a block scrolls into view (once) |
| `SplitText` | Word-by-word masked headline reveal |
| `Counter` | Numbers counting up when visible |
| `Magnetic` | Buttons that lean toward the cursor |
| `Tilt`, `Spotlight`, `Parallax` | Cards, hover light, depth on photos |

Guidelines followed throughout:

- Animate only `transform` and `opacity` where possible.
- **Above-the-fold entrances use CSS keyframes, not JavaScript.** The hero headline, eyebrow, buttons and page titles start animating as soon as the HTML is painted instead of waiting for hydration.
- Everything below the fold uses Motion's `whileInView` with `once: true`.
- `MotionConfig reducedMotion="user"` plus a global CSS rule make every animation collapse to its end state when the user prefers reduced motion.

## Performance

Lighthouse mobile on the live site: **Performance 97–98, Accessibility 97, Best Practices 100, SEO 100** (LCP ≈ 2.1 s, TBT ≈ 10–30 ms, CLS ≈ 0.001). The autoplaying hero keeps changing pixels, so Speed Index varies between runs.

The things that mattered most, found by profiling rather than guessing:

1. **Don't hide the page until hydration.** The page-transition wrapper used to render `opacity: 0` on the server, so the hero photo was downloaded at 1.7 s but not painted until JavaScript ran (LCP 4.5 s). `template.tsx` now uses `initial={false}` on the first mount and only fades on client navigations.
2. **CSS for entrance animations** (see above). Same reason: content shouldn't depend on JS to become visible.
3. **No smooth-scroll library on touch devices.** Lenis attaches non-passive `touchmove` listeners even when it leaves touch scrolling native. That forces every swipe to wait for the main thread, which made scrolling stutter on phones while the page was still booting. Lenis is now created only when `(pointer: fine)` matches. A small `useScrollLock` hook freezes the page under overlays with either Lenis or `overflow: hidden`.
4. **Fonts without layout shift.** Fonts are self-hosted, the Latin and Latin Extended Montserrat files are preloaded, and the fallback stack uses `@font-face` rules on local Arial and Times with `size-adjust`, `ascent-override` and `descent-override` measured against the real fonts. CLS dropped from 0.25–0.37 to 0.001.
5. **Cheap effects on mobile GPUs.** Large `filter: blur()` glows were replaced with radial gradients that look the same, and the film-grain overlay (`mix-blend-mode`) is disabled on coarse pointers.
6. **Right-sized images.** `next/image` with accurate `sizes`, `fetchPriority="high"` on the first hero slide, blur placeholders from the manifest, unit logos at 160px instead of 320px.

## Accessibility

- Semantic landmarks, a single `h1` per page, and a skip link to the main content (`#icerik`).
- Visible `:focus-visible` outlines defined in `@layer base`, so components can override them with utilities.
- Text colours meet WCAG AA 4.5:1 on all backgrounds. The faint ink tones were checked numerically against paper, white and deep paper.
- Charts have a table view toggle, axis labels and hover tooltips; colour is never the only signal.
- Dialogs (`role="dialog"`, `aria-modal`) close with Escape and on backdrop click.
- Respects `prefers-reduced-motion` everywhere.

## Brand

Colours, type and logo rules come from DEÜ's corporate identity guide, kept in [`brand/`](../brand/README.md):

- Primary **Pantone 301 C** `#004B87`, with navy and paper neutrals defined as Tailwind `@theme` tokens in `src/app/globals.css`.
- **Montserrat** for all text. A serif italic (Instrument Serif) is used only as an editorial accent.
- The emblem is only shown in blue, black or white, and is never rotated, recoloured or given effects. This is why unit logos don't spin on hover even though other cards do.
