import type { Metadata } from "next";
import { AnnouncementsList } from "@/components/home/announcements-list";
import { Reveal } from "@/components/motion/reveal";
import { PageHeader } from "@/components/ui/page-header";
import { getAnnouncements } from "@/lib/content";

export const metadata: Metadata = {
  title: "Duyurular",
  description: "Dokuz Eylül Üniversitesi akademik takvim, sınav, başvuru ve etkinlik duyuruları.",
};

const monthFmt = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric", timeZone: "Europe/Istanbul" });

export default function AnnouncementsPage() {
  const items = getAnnouncements();
  const groups = new Map<string, typeof items>();
  for (const a of items) {
    const key = a.date ? monthFmt.format(new Date(a.date)) : "Diğer";
    groups.set(key, [...(groups.get(key) ?? []), a]);
  }

  return (
    <>
      <PageHeader
        eyebrow="Duyurular"
        title={["Gündemi", { text: "kaçırmayın", className: "serif-accent text-deu" }]}
        description="Akademik takvim, sınav sonuçları, başvurular, ilanlar ve etkinlikler."
        crumbs={[{ label: "Duyurular", href: "/duyurular" }]}
      />
      <div className="container-x space-y-20 pb-32 pt-20">
        {[...groups].map(([month, list]) => (
          <section key={month} className="grid gap-8 lg:grid-cols-12">
            <Reveal className="lg:col-span-3">
              <h2 className="sticky top-28 text-2xl font-semibold capitalize tracking-tight">
                {month}
                <span className="ml-2 align-top text-sm font-medium text-ink/65">{list.length}</span>
              </h2>
            </Reveal>
            <div className="lg:col-span-9">
              <AnnouncementsList items={list} />
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
