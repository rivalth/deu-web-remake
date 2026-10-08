import { ArrowDownToLine, ArrowLeft, ArrowUpRight, FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Reveal } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { Markdown } from "@/components/ui/markdown";
import { ShareButton } from "@/components/ui/share-button";
import { getAnnouncement, getAnnouncements, listSlugs } from "@/lib/content";
import { formatDate } from "@/lib/text";

export function generateStaticParams() {
  return listSlugs("announcements").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/duyurular/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = getAnnouncement(slug);
  return a ? { title: a.title } : {};
}

export default function AnnouncementPage({ params }: PageProps<"/duyurular/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" aria-busy="true" />}>
      <Announcement params={params} />
    </Suspense>
  );
}

function fileName(url: string) {
  const name = decodeURIComponent(url.split("/").pop() ?? url);
  return name.replace(/[-_]+/g, " ").replace(/\.(\w+)$/, "");
}

async function Announcement({ params }: { params: PageProps<"/duyurular/[slug]">["params"] }) {
  const { slug } = await params;
  const a = getAnnouncement(slug);
  if (!a) notFound();
  const others = getAnnouncements()
    .filter((x) => x.slug !== slug)
    .slice(0, 4);

  return (
    <article className="pt-[calc(var(--header-h)+3rem)]">
      <div className="container-x grid gap-16 pb-32 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Reveal y={10}>
            <Link
              href="/duyurular"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-ink/55 transition-colors hover:text-deu"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Tüm duyurular
            </Link>
          </Reveal>
          {a.date && (
            <time dateTime={a.date} className="mt-10 block text-sm font-semibold text-deu">
              {formatDate(a.date)}
            </time>
          )}
          <SplitText as="h1" inView={false} stagger={0.03} className="display mt-4 text-4xl sm:text-6xl" parts={[a.title]} />
          <Reveal delay={0.3} className="mt-12">
            <Markdown minImageWidth={300}>{a.body}</Markdown>
          </Reveal>

          {a.attachments.length > 0 && (
            <Reveal className="mt-14">
              <h2 className="eyebrow text-ink/50">Ekler</h2>
              <ul className="mt-4 grid gap-3">
                {a.attachments.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-deu/30 hover:shadow-lg hover:shadow-deu/10"
                    >
                      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-deu-mist text-deu">
                        <FileText className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold capitalize">{fileName(url)}</span>
                        <span className="text-xs uppercase text-ink/45">{url.split(".").pop()}</span>
                      </span>
                      <span className="relative grid size-10 place-items-center overflow-hidden rounded-full bg-paper transition-colors group-hover:bg-deu group-hover:text-white">
                        <ArrowDownToLine className="size-4 transition-transform duration-500 group-hover:translate-y-10" />
                        <ArrowDownToLine className="absolute size-4 -translate-y-10 transition-transform duration-500 group-hover:translate-y-0" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          <div className="mt-14 flex flex-wrap gap-3 border-t border-line pt-8">
            <ShareButton title={a.title} />
            <a
              href={a.source}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-ink/55 hover:text-deu"
            >
              Kaynakta görüntüle <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
            </a>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="rounded-[2rem] bg-white p-8 lg:sticky lg:top-28">
            <p className="eyebrow text-deu">Diğer duyurular</p>
            <ul className="mt-6 divide-y divide-line">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={`/duyurular/${o.slug}`} className="group block py-4">
                    <span className="text-xs font-semibold text-ink/45">{formatDate(o.date)}</span>
                    <span className="mt-1 block font-semibold leading-snug transition-colors group-hover:text-deu">{o.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </article>
  );
}
