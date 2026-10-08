import { ArrowLeft, ArrowUpRight, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { NewsCard } from "@/components/news/news-card";
import { ArrowLink } from "@/components/ui/button";
import { Gallery } from "@/components/ui/gallery";
import { Markdown } from "@/components/ui/markdown";
import { Photo } from "@/components/ui/photo";
import { ShareButton } from "@/components/ui/share-button";
import { getNews, getNewsArticle, listSlugs } from "@/lib/content";
import { formatDate, readingTime } from "@/lib/text";

export function generateStaticParams() {
  return listSlugs("news").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/haberler/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = getNewsArticle(slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.excerpt,
    openGraph: { images: a.cover ? [a.cover.src] : [] },
  };
}

export default function ArticlePage({ params }: PageProps<"/haberler/[slug]">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <Article params={params} />
    </Suspense>
  );
}

function ArticleSkeleton() {
  const bar = "rounded-full bg-[linear-gradient(90deg,var(--color-paper-deep),white,var(--color-paper-deep))] bg-[length:200%_100%] animate-shimmer";
  return (
    <div className="container-x max-w-5xl pt-[calc(var(--header-h)+6rem)]" aria-busy="true">
      <div className={`h-5 w-40 ${bar}`} />
      <div className={`mt-8 h-14 w-full ${bar}`} />
      <div className={`mt-4 h-14 w-2/3 ${bar}`} />
      <div className={`mt-14 aspect-[21/10] w-full !rounded-[2rem] ${bar}`} />
    </div>
  );
}

async function Article({ params }: { params: PageProps<"/haberler/[slug]">["params"] }) {
  const { slug } = await params;
  const article = getNewsArticle(slug);
  if (!article) notFound();

  const all = getNews();
  const i = all.findIndex((n) => n.slug === slug);
  const prev = all[i + 1];
  const next = all[i - 1];
  const related = all.filter((n) => n.slug !== slug).slice(0, 3);
  const hero = article.lead ?? article.cover;
  const gallery = article.gallery.filter((g) => g.src !== hero?.src);

  return (
    <article>
      <header className="pt-[calc(var(--header-h)+3rem)]">
        <div className="container-x max-w-5xl">
          <Reveal y={10}>
            <Link
              href="/haberler"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-ink/70 transition-colors hover:text-deu"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Tüm haberler
            </Link>
          </Reveal>
          <div className="mt-10 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-deu px-3 py-1 text-xs font-semibold text-white">
              {article.categories[0] ?? "Haber"}
            </span>
            <time dateTime={article.date} className="font-medium text-ink/70">
              {formatDate(article.date)}
            </time>
            <span className="flex items-center gap-1.5 text-ink/65">
              <Clock className="size-3.5" /> {readingTime(article.body)} dk okuma
            </span>
          </div>
          <SplitText
            as="h1"
            inView={false}
            stagger={0.025}
            className="display mt-6 text-4xl sm:text-6xl"
            parts={[article.title]}
          />
        </div>
        {hero && (
          <Reveal delay={0.25} y={60} className="container-x mt-14">
            <Parallax offset={60} className="aspect-[16/9] rounded-[2rem] sm:aspect-[21/10]">
              <Photo media={hero} preload quality={85} sizes="100vw" className="size-full" />
            </Parallax>
          </Reveal>
        )}
      </header>

      <div className="container-x mt-16 grid gap-12 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="flex flex-wrap items-center gap-3 lg:sticky lg:top-28 lg:flex-col lg:items-start">
            <ShareButton title={article.title} />
            <a
              href={article.source}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-ink/70 transition-colors hover:text-deu"
            >
              Kaynakta görüntüle
              <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
            </a>
          </div>
        </aside>
        <Reveal className="max-w-[720px] lg:col-span-7">
          <Markdown minImageWidth={Number.POSITIVE_INFINITY}>{article.body}</Markdown>
        </Reveal>
      </div>

      {gallery.length > 0 && (
        <section className="container-x mt-24">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-3xl font-semibold tracking-tight">
              Fotoğraflar <span className="serif-accent text-deu">({gallery.length})</span>
            </h2>
            <p className="hidden text-sm text-ink/65 sm:block">Büyütmek için tıklayın</p>
          </div>
          <Gallery items={gallery} title={article.title} />
        </section>
      )}

      <nav className="container-x mt-24 grid gap-4 border-y border-line py-10 sm:grid-cols-2">
        {[
          { item: prev, label: "Önceki haber", align: "" },
          { item: next, label: "Sonraki haber", align: "sm:text-right" },
        ].map(({ item, label, align }) =>
          item ? (
            <Link key={label} href={`/haberler/${item.slug}`} className={`group block rounded-3xl p-6 transition-colors hover:bg-white ${align}`}>
              <span className="eyebrow text-ink/65">{label}</span>
              <span className="mt-3 block text-xl font-semibold leading-snug tracking-tight transition-colors group-hover:text-deu">
                {item.title}
              </span>
            </Link>
          ) : (
            <span key={label} />
          ),
        )}
      </nav>

      <section className="container-x py-28">
        <div className="mb-12 flex items-end justify-between">
          <h2 className="display text-4xl sm:text-5xl">
            Diğer <span className="serif-accent text-deu">haberler</span>
          </h2>
          <ArrowLink href="/haberler" className="text-deu">
            Tümü
          </ArrowLink>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((n, k) => (
            <Reveal key={n.slug} delay={k * 0.08}>
              <NewsCard item={n} />
            </Reveal>
          ))}
        </div>
      </section>
    </article>
  );
}
