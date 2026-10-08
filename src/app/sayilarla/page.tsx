import type { Metadata } from "next";
import { Counter } from "@/components/motion/counter";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { BarList, ColumnChart, type Datum } from "@/components/stats/charts";
import { PageHeader } from "@/components/ui/page-header";
import { getStats } from "@/lib/content";
import { nf } from "@/lib/text";

export const metadata: Metadata = {
  title: "Sayılarla DEÜ",
  description: "Dokuz Eylül Üniversitesi öğrenci, akademik ve idari personel ile fiziksel alan istatistikleri.",
};

const STUDENT_LABELS: Record<string, string> = {
  Önlisans: "Önlisans",
  Lisans: "Lisans",
  "Tezli YL": "Tezli yüksek lisans",
  "Tezsiz YL": "Tezsiz yüksek lisans",
  Doktora: "Doktora",
  "Sanatta Yet.": "Sanatta yeterlik",
};

export default function StatsPage() {
  const s = getStats();
  const studentsByYear: Datum[] =
    s.studentsByYear?.rows
      .filter((r) => r.label !== "Güncel")
      .map((r) => ({
        label: r.label,
        value: r.values.at(-1) ?? 0,
        detail: s.studentsByYear!.columns.slice(1, -1).map((c, i) => ({ label: c, value: r.values[i] })),
      })) ?? [];
  const academicByYear: Datum[] =
    s.academic?.rows.filter((r) => r.label !== "Güncel").map((r) => ({
      label: r.label,
      value: r.values.at(-1) ?? 0,
      detail: s.academic!.columns.slice(1, -1).map((c, i) => ({ label: c, value: r.values[i] })),
    })) ?? [];
  const academicNow = s.academic?.rows.find((r) => r.label === "Güncel");
  const academicMix: Datum[] =
    s.academic?.columns.slice(1, -1).map((c, i) => ({ label: c, value: academicNow?.values[i] ?? 0 })) ?? [];
  const staffByYear: Datum[] =
    s.staff?.rows.filter((r) => r.label !== "Güncel").map((r) => ({
      label: r.label,
      value: r.values.at(-1) ?? 0,
      detail: s.staff!.columns.slice(1, -1).map((c, i) => ({ label: c, value: r.values[i] })),
    })) ?? [];
  const facilities = s.physical.flatMap((t) => t.rows.filter((r) => r.value > 0).map((r) => ({ ...r, group: t.title })));
  const pick = (label: string) => facilities.find((f) => f.label === label)?.value ?? 0;
  const dormRooms = s.physical.find((t) => t.title === "Öğrenci Yurtları")?.rows.reduce((a, r) => a + r.value, 0) ?? 0;
  const years = studentsByYear.map((d) => d.label);
  const missing = years.includes("2023-2024") && years.includes("2025-2026") && !years.includes("2024-2025");

  return (
    <>
      <PageHeader
        eyebrow="Sayılarla DEÜ"
        title={["Rakamlarla", { text: "Dokuz Eylül", className: "serif-accent text-deu" }]}
        description="Öğrenci, akademik ve idari kadro ile kampüs olanaklarına dair güncel veriler. Kaynak: sayilarla.deu.edu.tr"
        crumbs={[{ label: "Sayılarla DEÜ", href: "/sayilarla" }]}
      />

      <section className="container-x py-20">
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="grain relative overflow-hidden rounded-[2rem] bg-deu p-10 text-white lg:col-span-5">
            <p className="text-sm font-semibold text-white/70">Toplam öğrenci</p>
            <Counter value={s.studentTotal} className="mt-4 block text-7xl font-semibold tracking-[-0.04em] sm:text-8xl" />
            <p className="mt-6 max-w-sm text-white/70">
              Önlisanstan doktoraya, {s.students.length} farklı öğretim düzeyinde kayıtlı öğrenci.
            </p>
          </div>
          <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:col-span-7">
            {s.students.map((x) => (
              <StaggerItem key={x.label} className="rounded-[1.5rem] bg-white p-6">
                <p className="text-sm text-ink/70">{STUDENT_LABELS[x.label] ?? x.label}</p>
                <Counter value={x.value} className="mt-3 block text-3xl font-semibold tracking-tight sm:text-4xl" />
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-deu-mist">
                  <div className="h-full rounded-full bg-deu" style={{ width: `${Math.max(2, (x.value / s.studentTotal) * 100)}%` }} />
                </div>
                <p className="mt-2 text-xs text-ink/65">%{((x.value / s.studentTotal) * 100).toFixed(1).replace(".", ",")}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="container-x space-y-6 pb-24">
        <ColumnChart
          title="Yıllara göre öğrenci sayısı"
          subtitle="Tüm öğretim düzeyleri toplamı · üzerine gelerek dağılımı görün"
          data={studentsByYear}
          note={missing ? "Kaynak tabloda 2024-2025 dönemine ait veri bulunmuyor." : undefined}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <BarList title="Akademik kadro" subtitle={`Unvana göre · toplam ${nf.format(s.academicTotal)}`} data={academicMix} />
          <ColumnChart title="Akademisyen sayısı" subtitle="Yıllara göre toplam" data={academicByYear} height={240} />
        </div>
        <ColumnChart title="İdari personel" subtitle={`Yıllara göre toplam · güncel ${nf.format(s.staffTotal)}`} data={staffByYear} height={240} />
      </section>

      <section className="grain bg-navy py-24 text-white sm:py-32">
        <div className="container-x">
          <p className="eyebrow text-deu-sky">
            <span className="h-px w-8 bg-current" /> Kampüs olanakları
          </p>
          <SplitText
            className="display mt-5 max-w-3xl text-5xl sm:text-6xl"
            parts={["Öğrenmek için", { text: "alan", className: "serif-accent text-deu-sky" }, "çok."]}
          />
          <Stagger className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] bg-white/10 sm:grid-cols-4">
            {[
              { v: pick("Sınıf (Derslik)"), l: "Derslik" },
              { v: pick("Amfi"), l: "Amfi" },
              { v: pick("Bilgisayar Lab.") + pick("Diğer Lab."), l: "Laboratuvar" },
              { v: pick("Konferans Salonu"), l: "Konferans salonu" },
              { v: pick("Toplantı Salonu"), l: "Toplantı salonu" },
              { v: dormRooms, l: "Yurt odası" },
              { v: pick("Öğrenci Yemekhanesi") + pick("Ortak Yemekhaneler"), l: "Yemekhane" },
              { v: pick("Otel Dokuz Eylül"), l: "Otel Dokuz Eylül odası" },
            ].map((t) => (
              <StaggerItem key={t.l} className="bg-navy p-8 transition-colors hover:bg-navy-soft">
                <Counter value={t.v} className="block text-5xl font-semibold tracking-tight" />
                <p className="mt-2 text-sm text-white/60">{t.l}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
