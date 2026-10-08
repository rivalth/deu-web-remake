"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

const fmt = new Intl.NumberFormat("tr-TR");

/** Counts up from 0 to `value` the first time it scrolls into view. */
export function Counter({
  value,
  duration = 2.2,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduce) {
      el.textContent = prefix + fmt.format(value) + suffix;
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = prefix + fmt.format(Math.round(v)) + suffix;
      },
    });
    return () => controls.stop();
  }, [inView, value, duration, prefix, suffix, reduce]);

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {prefix}
      {fmt.format(value)}
      {suffix}
    </span>
  );
}
