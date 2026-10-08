# deu-web-remake

Dokuz Eylül Üniversitesi web sitesinin yeniden tasarımı. Next.js (App Router) + Tailwind CSS.

```bash
pnpm install
pnpm dev
```

## Klasörler

- `src/` — Next.js uygulaması
- `brand/` — resmi logolar, kurumsal kimlik kılavuzu, renk/font token'ları ([brand/README.md](brand/README.md))
- `content/` — deu.edu.tr'den çekilen içerik: sayfalar, haberler, duyurular, istatistikler ([content/README.md](content/README.md))
- `scripts/scrape_deu.py` — içerik çekici (`uv run scripts/scrape_deu.py`)

Bu bağımsız bir tasarım çalışmasıdır; DEÜ'nün resmi projesi değildir. Logolar ve içerik Dokuz Eylül Üniversitesi'ne aittir.
