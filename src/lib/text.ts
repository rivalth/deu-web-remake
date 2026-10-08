// Text helpers shared by server and client code.

const ACRONYMS = new Set([
  "DEÜ", "EÜ", "URAP", "UI", "COP31", "YKS", "TAOM", "ACR", "TEI", "MYO", "AACSB", "CWUR",
  "DEPARK", "BAMBU", "ARGEMIP", "AB", "ABD", "THE", "SDG", "TÜBİTAK", "YÖK", "YÖKAK", "ÖSYM",
  "İİBF", "BAP", "TTO", "KVKK", "DEBİS", "OGEB", "EBS", "III", "II", "IV", "TBMM", "NATO", "AR-GE",
  "TEKNOFEST", "KAYEP-5", "UETS", "HRS4R", "ADEP", "ÖYP", "TV", "AI", "LTD", "A.Ş.", "T.C.",
]);

// Latin words that Turkish lowercasing would mangle (I -> ı)
const FIXED: Record<string, string> = {
  MARITIME: "Maritime", GREENMETRIC: "GreenMetric", STEINWAY: "Steinway", HOPKINS: "Hopkins",
  CONVERGENCE: "Convergence", TALKS: "Talks", DAY: "Day", ZERO: "Zero", WASTE: "Waste",
};

const SMALL = new Set(["ve", "ile", "için", "de", "da", "ki", "bir", "veya", "ya", "mi", "mı", "en"]);

const lower = (s: string) => s.toLocaleLowerCase("tr-TR");
const upper = (s: string) => s.toLocaleUpperCase("tr-TR");
const cap = (s: string) => (s ? upper(s[0]) + lower(s.slice(1)) : s);

/** Convert an ALL-CAPS Turkish headline to title case, keeping acronyms. */
export function smartTitle(input: string): string {
  const s = input.replace(/\s+/g, " ").trim();
  const letters = s.replace(/[^\p{L}]/gu, "");
  const caps = letters.replace(/[^\p{Lu}]/gu, "").length;
  if (!letters.length || caps / letters.length < 0.7) return s;

  return s
    .split(" ")
    .map((word, i) => {
      // split off Turkish suffix after an apostrophe: DEÜ’DE -> DEÜ + ’DE
      const m = word.match(/^([^’']+)([’'].*)?$/);
      const base = m?.[1] ?? word;
      const suffix = m?.[2] ? lower(m[2]) : "";
      const core = base.replace(/^[“"(«]+|[”"):,.;!?»]+$/g, "");
      const lead = base.slice(0, base.indexOf(core));
      const trail = base.slice(base.indexOf(core) + core.length);
      let out: string;
      if (FIXED[core]) out = FIXED[core];
      else if (ACRONYMS.has(core) || /\d/.test(core)) out = core;
      else if (i > 0 && SMALL.has(lower(core))) out = lower(core);
      else out = core.split("-").map(cap).join("-");
      return lead + out + trail + suffix;
    })
    .join(" ");
}

const dateFmt = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Istanbul",
});
const dayFmt = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", timeZone: "Europe/Istanbul" });
const monFmt = new Intl.DateTimeFormat("tr-TR", { month: "short", timeZone: "Europe/Istanbul" });

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : dateFmt.format(d);
}

export function dateParts(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return { day: dayFmt.format(d), month: monFmt.format(d).replace(".", ""), year: String(d.getUTCFullYear()) };
}

export function readingTime(markdown: string): number {
  const words = markdown.replace(/!\[[^\]]*\]\([^)]*\)/g, "").split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export const nf = new Intl.NumberFormat("tr-TR");

export function slugify(s: string): string {
  return lower(s)
    .normalize("NFC")
    .replace(/[çğıöşüâîû]/g, (c) => ({ ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" })[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
