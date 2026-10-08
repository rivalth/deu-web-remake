import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Media } from "@/lib/media";
import { Parallax } from "../motion/parallax";
import { Reveal } from "../motion/reveal";
import { SplitText } from "../motion/split-text";
import { Photo } from "./photo";

type Part = string | { text: string; className?: string };

export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs = [],
  image,
  children,
}: {
  eyebrow: string;
  title: Part[];
  description?: ReactNode;
  crumbs?: { label: string; href: string }[];
  image?: Media | null;
  children?: ReactNode;
}) {
  return (
    <header className="relative pt-[calc(var(--header-h)+3.5rem)]">
      <div className="container-x">
        <Reveal y={10}>
          <nav aria-label="Konum" className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-ink/65">
            <Link href="/" className="transition-colors hover:text-deu">
              Ana sayfa
            </Link>
            {crumbs.map((c) => (
              <span key={c.href} className="flex items-center gap-1.5">
                <ChevronRight className="size-3" />
                <Link href={c.href} className="transition-colors hover:text-deu">
                  {c.label}
                </Link>
              </span>
            ))}
          </nav>
        </Reveal>
        <p className="eyebrow mt-10 text-deu">
          <span className="h-px w-8 bg-current" /> {eyebrow}
        </p>
        <SplitText as="h1" inView={false} delay={0.1} className="display mt-5 max-w-5xl text-5xl sm:text-7xl lg:text-8xl" parts={title} />
        {description && (
          <Reveal delay={0.4} className="mt-8 max-w-2xl text-lg leading-relaxed text-ink/70">
            {description}
          </Reveal>
        )}
        {children && <Reveal delay={0.5}>{children}</Reveal>}
      </div>
      {image && (
        <Reveal delay={0.3} y={60} className="container-x mt-16">
          <Parallax offset={50} className="aspect-[21/9] rounded-[2rem]">
            <Photo media={image} preload sizes="100vw" quality={85} className="size-full" />
          </Parallax>
        </Reveal>
      )}
    </header>
  );
}
