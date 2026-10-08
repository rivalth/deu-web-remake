"use client";

import type { ComponentProps } from "react";

/** Card whose border + background glow follows the cursor (CSS vars, no re-render). */
export function Spotlight({ className, children, ...rest }: ComponentProps<"div">) {
  return (
    <div
      {...rest}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className={`group/spot relative overflow-hidden ${className ?? ""}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgb(140 195 239 / 0.18), transparent 60%)",
        }}
      />
      {children}
    </div>
  );
}
