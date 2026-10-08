import { Counter } from "../motion/counter";
import { Stagger, StaggerItem } from "../motion/reveal";
import { ArrowLink } from "../ui/button";

export type Stat = { value: number; label: string; note?: string; suffix?: string };

export function StatsBand({ stats }: { stats: Stat[] }) {
  return (
    <section className="container-x pb-28 sm:pb-36">
      <div className="flex flex-col justify-between gap-6 border-t border-ink pt-6 sm:flex-row sm:items-center">
        <p className="eyebrow text-ink">Sayılarla Dokuz Eylül</p>
        <ArrowLink href="/sayilarla" className="text-deu">
          Tüm veriler
        </ArrowLink>
      </div>
      <Stagger className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-6">
        {stats.map((s, i) => (
          <StaggerItem
            key={s.label}
            className={i === 0 ? "col-span-2 lg:col-span-2" : "border-l border-line pl-5 lg:col-span-1"}
          >
            <Counter
              value={s.value}
              suffix={s.suffix}
              className={
                i === 0
                  ? "block text-7xl font-semibold tracking-[-0.05em] text-deu sm:text-8xl"
                  : "block text-4xl font-semibold tracking-tight text-ink sm:text-5xl"
              }
            />
            <p className="mt-3 text-sm font-semibold">{s.label}</p>
            {s.note && <p className="mt-1 text-xs leading-relaxed text-ink/70">{s.note}</p>}
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
