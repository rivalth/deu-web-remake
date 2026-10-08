import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { media } from "@/lib/media";

/**
 * Renders scraped markdown. Large images become optimized <Image>s;
 * thumbnails are dropped (articles show them in a gallery instead).
 */
export function Markdown({ children, minImageWidth = 900 }: { children: string; minImageWidth?: number }) {
  return (
    <div className="prose-deu">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt }) => {
            const m = typeof src === "string" ? media(src, alt ?? "") : null;
            if (!m || m.width < minImageWidth) return null;
            return (
              <span className="my-10 block overflow-hidden rounded-3xl">
                <Image
                  src={m.src}
                  alt={alt ?? ""}
                  width={m.width}
                  height={m.height}
                  sizes="(min-width: 1024px) 720px, 100vw"
                  placeholder="blur"
                  blurDataURL={m.blurDataURL}
                  className="h-auto w-full"
                />
              </span>
            );
          },
          a: ({ href = "", children }) => {
            // image-only links (thumbnail wrappers) collapse with their image
            const internal = href.startsWith("/") || href.startsWith("#");
            return internal ? (
              <Link href={href}>{children}</Link>
            ) : (
              <a href={href} target="_blank" rel="noreferrer">
                {children}
              </a>
            );
          },
          p: ({ children }) => {
            const empty =
              children == null || (Array.isArray(children) && children.every((c) => c == null || c === "\n" || c === " "));
            return empty ? null : <p>{children}</p>;
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
