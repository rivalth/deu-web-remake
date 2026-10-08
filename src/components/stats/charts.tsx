"use client";

import { Table2, BarChart3 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const fmt = new Intl.NumberFormat("tr-TR");
const EASE = [0.16, 1, 0.3, 1] as const;

export type Datum = { label: string; value: number; detail?: { label: string; value: number }[] };

function niceTicks(max: number, count = 4) {
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const top = Math.ceil(max / step) * step;
  return { top, ticks: Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step) };
}

/** Card frame with a chart/table toggle so every chart has a table view. */
function ChartFrame({
  title,
  subtitle,
  note,
  table,
  children,
}: {
  title: string;
  subtitle?: string;
  note?: string;
  table: { columns: string[]; rows: (string | number)[][] };
  children: ReactNode;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");
  return (
    <figure className="rounded-[2rem] bg-white p-6 sm:p-10">
      <div className="flex items-start justify-between gap-4">
        <figcaption>
          <p className="text-xl font-semibold tracking-tight">{title}</p>
          {subtitle && <p className="mt-1 text-sm text-ink/55">{subtitle}</p>}
        </figcaption>
        <div className="flex shrink-0 rounded-full border border-line p-1" role="group" aria-label="Görünüm">
          {(
            [
              ["chart", BarChart3, "Grafik"],
              ["table", Table2, "Tablo"],
            ] as const
          ).map(([v, Icon, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              aria-label={label}
              className={cn(
                "relative grid size-9 place-items-center rounded-full transition-colors",
                view === v ? "text-white" : "text-ink/50 hover:text-ink",
              )}
            >
              {view === v && <motion.span layoutId={`view-${title}`} className="absolute inset-0 rounded-full bg-ink" />}
              <Icon className="relative size-4" />
            </button>
          ))}
        </div>
      </div>
      <div className="mt-8">
        <AnimatePresence mode="wait" initial={false}>
          {view === "chart" ? (
            <motion.div key="chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {children}
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-h-[420px] overflow-auto"
              data-lenis-prevent
            >
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr>
                    {table.columns.map((c, i) => (
                      <th key={c} className={cn("border-b border-line py-2 pr-4 font-semibold", i > 0 && "text-right")}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {table.rows.map((r) => (
                    <tr key={String(r[0])} className="transition-colors hover:bg-paper">
                      {r.map((v, i) => (
                        <td key={i} className={cn("border-b border-line py-2 pr-4", i > 0 && "text-right")}>
                          {typeof v === "number" ? fmt.format(v) : v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {note && <p className="mt-6 text-xs text-ink/45">{note}</p>}
    </figure>
  );
}

/** Single-series column chart: thin columns from one baseline, hover tooltip, end label. */
export function ColumnChart({
  title,
  subtitle,
  note,
  data,
  height = 300,
}: {
  title: string;
  subtitle?: string;
  note?: string;
  data: Datum[];
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value));
  const { top, ticks } = niceTicks(max);
  const peak = data.findIndex((d) => d.value === max);
  const last = data.length - 1;
  const detailCols = data[0]?.detail?.map((d) => d.label) ?? [];

  return (
    <ChartFrame
      title={title}
      subtitle={subtitle}
      note={note}
      table={{
        columns: ["Dönem", ...detailCols, "Toplam"],
        rows: data.map((d) => [d.label, ...(d.detail?.map((x) => x.value) ?? []), d.value]),
      }}
    >
      <div className="relative pl-14" style={{ height }} onPointerLeave={() => setHover(null)}>
        {/* hairline grid + y ticks */}
        {ticks.map((t) => (
          <div key={t} className="absolute inset-x-0 flex items-center" style={{ bottom: `${(t / top) * 100}%` }}>
            <span className="w-12 -translate-y-px pr-2 text-right text-[11px] tabular-nums text-ink/40">{fmt.format(t)}</span>
            <span className={cn("h-px flex-1", t === 0 ? "bg-ink/25" : "bg-line")} />
          </div>
        ))}
        <div className="absolute inset-y-0 left-14 right-0 flex items-end">
          {data.map((d, i) => {
            const h = (d.value / top) * 100;
            const labelled = i === last || i === peak;
            const dim = hover !== null && hover !== i;
            return (
              <div
                key={d.label}
                className="relative flex h-full flex-1 cursor-default items-end justify-center"
                onPointerEnter={() => setHover(i)}
              >
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.9, delay: i * 0.04, ease: EASE }}
                  className={cn(
                    "w-[min(24px,60%)] origin-bottom rounded-t-[4px] transition-opacity duration-300",
                    dim ? "opacity-35" : "opacity-100",
                  )}
                  style={{ height: `${h}%`, backgroundColor: "var(--color-deu)" }}
                />
                {labelled && hover === null && (
                  <span
                    className="pointer-events-none absolute -translate-y-2 whitespace-nowrap text-xs font-semibold tabular-nums text-ink"
                    style={{ bottom: `${h}%` }}
                  >
                    {fmt.format(d.value)}
                  </span>
                )}
                <AnimatePresence>
                  {hover === i && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className={cn(
                        "pointer-events-none absolute top-0 z-10 w-max min-w-40 rounded-2xl bg-navy p-3 text-xs text-white shadow-xl",
                        i > data.length / 2 ? "right-[calc(50%+18px)]" : "left-[calc(50%+18px)]",
                      )}
                    >
                      <p className="font-semibold">{d.label}</p>
                      <p className="mt-1 text-lg font-semibold tabular-nums">{fmt.format(d.value)}</p>
                      {d.detail && (
                        <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 text-white/70">
                          {d.detail
                            .filter((x) => x.value > 0)
                            .map((x) => (
                              <div key={x.label} className="contents">
                                <dt>{x.label}</dt>
                                <dd className="text-right tabular-nums text-white">{fmt.format(x.value)}</dd>
                              </div>
                            ))}
                        </dl>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex pl-14">
        {data.map((d, i) => (
          <span
            key={d.label}
            className={cn(
              "flex-1 text-center text-[10px] tabular-nums text-ink/45 transition-colors sm:text-[11px]",
              hover === i && "font-semibold text-ink",
              data.length > 10 && i % 2 === 1 && "max-sm:invisible",
            )}
          >
            {d.label.replace(/^(\d{4})-\d{2}(\d{2})$/, "$1–$2")}
          </span>
        ))}
      </div>
    </ChartFrame>
  );
}

/** Single-series horizontal bars with the value at each bar's tip. */
export function BarList({ title, subtitle, data }: { title: string; subtitle?: string; data: Datum[] }) {
  const max = Math.max(...data.map((d) => d.value));
  const [hover, setHover] = useState<number | null>(null);
  return (
    <ChartFrame
      title={title}
      subtitle={subtitle}
      table={{ columns: ["Kategori", "Sayı"], rows: data.map((d) => [d.label, d.value]) }}
    >
      <ul className="space-y-4" onPointerLeave={() => setHover(null)}>
        {data.map((d, i) => (
          <li
            key={d.label}
            onPointerEnter={() => setHover(i)}
            className={cn("grid grid-cols-[120px_1fr] items-center gap-4 transition-opacity sm:grid-cols-[160px_1fr]", hover !== null && hover !== i && "opacity-40")}
          >
            <span className="text-sm font-medium">{d.label}</span>
            <span className="flex items-center gap-3">
              <motion.span
                initial={{ width: 0 }}
                whileInView={{ width: `${(d.value / max) * 85}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.08, ease: EASE }}
                className="block h-6 rounded-r-[4px]"
                style={{ backgroundColor: "var(--color-deu)" }}
              />
              <span className="text-sm font-semibold tabular-nums">{fmt.format(d.value)}</span>
            </span>
          </li>
        ))}
      </ul>
    </ChartFrame>
  );
}
