import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "light" | "ghost" | "ghost-light";

const variants: Record<Variant, { root: string; dot: string }> = {
  primary: { root: "bg-deu text-white hover:bg-navy", dot: "bg-white text-deu" },
  light: { root: "bg-white text-ink hover:bg-deu-mist", dot: "bg-deu text-white" },
  ghost: { root: "border border-ink/15 text-ink hover:border-ink/40", dot: "bg-ink text-white" },
  "ghost-light": { root: "border border-white/25 text-white hover:border-white/60 hover:bg-white/5", dot: "bg-white text-ink" },
};

/** Text that rolls up to a duplicate on hover. */
export function RollText({ children }: { children: string }) {
  return (
    <span className="relative inline-flex overflow-hidden">
      <span className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 translate-y-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}

export function Button({
  href,
  children,
  variant = "primary",
  className,
  icon,
  ...rest
}: Omit<ComponentProps<typeof Link>, "children"> & {
  children: string;
  variant?: Variant;
  icon?: ReactNode;
}) {
  const v = variants[variant];
  const external = typeof href === "string" && href.startsWith("http");
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      {...rest}
      className={cn(
        "group inline-flex h-12 items-center gap-3 rounded-full pl-6 pr-1.5 text-sm font-semibold transition-colors duration-300 active:scale-[0.98]",
        v.root,
        className,
      )}
    >
      <RollText>{children}</RollText>
      <span
        className={cn(
          "grid size-9 place-items-center rounded-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45",
          v.dot,
        )}
      >
        {icon ?? <ArrowUpRight className="size-4" strokeWidth={2.2} />}
      </span>
    </Link>
  );
}

/** Inline text link with a sliding arrow. */
export function ArrowLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const external = href.startsWith("http");
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={cn("group inline-flex items-center gap-2 text-sm font-semibold", className)}
    >
      <span className="link-underline">{children}</span>
      <span className="relative inline-flex size-4 overflow-hidden">
        <ArrowUpRight className="size-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-4 group-hover:translate-x-4" />
        <ArrowUpRight className="absolute size-4 -translate-x-4 translate-y-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0 group-hover:translate-y-0" />
      </span>
    </Link>
  );
}
