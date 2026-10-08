import type { Metadata } from "next";
import { NewsBrowser } from "@/components/news/news-browser";
import { PageHeader } from "@/components/ui/page-header";
import { getNews } from "@/lib/content";

export const metadata: Metadata = {
  title: "Haberler",
  description: "Dokuz Eylül Üniversitesi'nden güncel haberler, etkinlikler ve başarılar.",
};

export default function NewsPage() {
  const news = getNews().map(({ slug, title, date, categories, cover, excerpt }) => ({
    slug,
    title,
    date,
    categories,
    cover,
    excerpt,
  }));
  return (
    <>
      <PageHeader
        eyebrow="Haber portalı"
        title={["Kampüsten", { text: "haberler", className: "serif-accent text-deu" }]}
        description="Araştırmalar, ödüller, etkinlikler ve mezuniyetler: Dokuz Eylül'de neler oluyor?"
        crumbs={[{ label: "Haberler", href: "/haberler" }]}
      />
      <section className="container-x pb-32 pt-16">
        <NewsBrowser items={news} />
      </section>
    </>
  );
}
