# deu-web-remake

Dokuz Eylül Üniversitesi web sitesinin yeniden tasarımı. Next.js (App Router) + Tailwind CSS.

```bash
pnpm install
pnpm dev
```

`dev` ve `build`, önce `scripts/sync-media.mjs` ile `content/` görsellerini ve birim logolarını `public/` altına kopyalar ve boyut/blur manifest'ini (`src/generated/media.json`) üretir. Bu çıktılar git'e girmez.

**Yığın:** Next.js 16 (App Router, Cache Components), Tailwind CSS 4, Motion (animasyon), Lenis (yumuşak kaydırma), cmdk (⌘K arama).

## Deploy (Netlify)

Repo Netlify'a bağlanınca ek ayar gerekmez: [`netlify.toml`](netlify.toml) build komutunu (`pnpm build`), Node 22'yi ve statik varlık cache başlıklarını tanımlar; Next.js, Netlify'ın OpenNext adapter'ı ile otomatik algılanır (Cache Components, PPR ve `next/image` → Netlify Image CDN desteklenir).

- Fontlar `@fontsource` paketleriyle self-host edilir; build sırasında dış servise istek atılmaz.
- `content/` sunucu tarafında `fs` ile okunduğu için `next.config.ts` içindeki `outputFileTracingIncludes` ile fonksiyon paketine eklenir.
- `metadataBase`, Netlify'ın verdiği `URL` değişkeninden gelir; özel alan adı için `NEXT_PUBLIC_SITE_URL` tanımlanabilir.

## Klasörler

- `src/app` — sayfalar: ana sayfa, `/haberler`, `/duyurular`, `/akademik`, `/arastirma`, `/hakkimizda`, `/sayilarla`
- `src/components` — `motion/` (reveal, split-text, counter, magnetic, tilt, parallax…), `home/`, `site/` (header, footer, arama)
- `src/lib/content.ts` — `content/` arşivini build sırasında okuyan veri katmanı
- `brand/` — resmi logolar, kurumsal kimlik kılavuzu, renk/font token'ları ([brand/README.md](brand/README.md))
- `content/` — deu.edu.tr'den çekilen içerik: sayfalar, haberler, duyurular, istatistikler ([content/README.md](content/README.md))
- `scripts/scrape_deu.py` — içerik çekici (`uv run scripts/scrape_deu.py`)

Bu bağımsız bir tasarım çalışmasıdır; DEÜ'nün resmi projesi değildir. Logolar ve içerik Dokuz Eylül Üniversitesi'ne aittir.
