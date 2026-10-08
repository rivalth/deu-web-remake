import Link from "next/link";
import type { NewsItem } from "@/lib/content";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/text";
import { Photo } from "../ui/photo";

type CardNews = Pick<NewsItem, "slug" | "title" | "date" | "categories" | "cover" | "excerpt">;

export function NewsCard({
  item,
  size = "md",
  className,
  draggable,
}: {
  item: CardNews;
  size?: "sm" | "md" | "lg";
  className?: string;
  draggable?: boolean;
}) {
  return (
    <Link
      href={`/haberler/${item.slug}`}
      draggable={draggable}
      className={cn("group block", className)}
      onDragStart={draggable === false ? (e) => e.preventDefault() : undefined}
    >
      <div className="relative overflow-hidden rounded-[1.75rem]">
        <Photo
          media={item.cover}
          sizes={size === "lg" ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 30vw, 80vw"}
          className={cn(size === "lg" ? "aspect-[16/11]" : size === "sm" ? "aspect-[4/3]" : "aspect-[4/3]")}
          imgClassName="transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06] pointer-events-none select-none"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-ink backdrop-blur">
          {formatDate(item.date)}
        </span>
        {item.categories[0] && (
          <span className="absolute right-4 top-4 rounded-full bg-deu px-3 py-1 text-[11px] font-semibold text-white">
            {item.categories[0]}
          </span>
        )}
      </div>
      <h3
        className={cn(
          "mt-5 font-semibold leading-snug tracking-tight text-ink transition-colors duration-300 group-hover:text-deu",
          size === "lg" ? "text-2xl sm:text-3xl" : "text-lg",
        )}
      >
        <span className="link-underline">{item.title}</span>
      </h3>
      {size === "lg" && <p className="mt-3 line-clamp-2 max-w-2xl text-ink/60">{item.excerpt}</p>}
    </Link>
  );
}
