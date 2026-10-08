# DEÜ İçerik Arşivi

Herkese açık DEÜ sitelerinden çekilen içerik. Yeniden tasarım için örnek/gerçek veri olarak kullanılır.
Yeniden üretmek için: `uv run scripts/scrape_deu.py` (bölüm bazında: `--only home|pages|news|announcements|stats`).

Çekim tarihi: 2026-10-08. İçerik ve görsellerin hakları Dokuz Eylül Üniversitesi'ne aittir.

| Yol | Kaynak | İçerik |
| --- | --- | --- |
| `site.json` | www.deu.edu.tr | Ana menü, üst linkler, akademik/idari birim ve araştırma menüleri (link listeleri), footer, sosyal medya, slider |
| `pages/*.md` | www.deu.edu.tr | Tarihçe, misyon, vizyon, temel değerler, yönetim, akademik/idari birimler, araştırma, mevzuat, e-bülten |
| `news/*.md`, `news/index.json` | haber.deu.edu.tr (RSS) | Son 60 haber: başlık, tarih, kategori, kapak görseli, tam metin |
| `announcements/*.md`, `announcements/index.json` | www.deu.edu.tr/tum-duyurular | Güncel duyurular + ekler |
| `stats/*.md`, `stats/index.json` | sayilarla.deu.edu.tr | Öğrenci, akademik/idari personel, fiziksel alan istatistikleri (tablolar JSON olarak) |
| `images/` | — | Sayfa, haber, duyuru ve slider görselleri (en fazla 1600px) |

## Format

Markdown dosyaları JSON değerli frontmatter içerir (`title`, `date`, `source`, `cover`, `images`, `attachments`).
Gövdedeki görsel yolları `content/` köküne göredir (`/images/news/...`).
