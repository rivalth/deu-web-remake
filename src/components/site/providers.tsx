"use client";

import Lenis from "lenis";
import { MotionConfig, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const LenisContext = createContext<Lenis | null>(null);

/** The smooth-scroll instance, or null on touch devices (they scroll natively). */
export const useLenis = () => useContext(LenisContext);

/** Freezes page scroll while `locked`, e.g. under a full-screen overlay. */
export function useScrollLock(locked: boolean) {
  const lenis = useLenis();
  useEffect(() => {
    if (!locked) return;
    if (lenis) {
      lenis.stop();
      return () => lenis.start();
    }
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [locked, lenis]);
}

function ScrollReset({ lenis }: { lenis: Lenis | null }) {
  const pathname = usePathname();
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname, lenis]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // Only for mouse/trackpad. Lenis registers non-passive touch listeners even when it
    // leaves touch scrolling native, which makes every swipe wait on a busy main thread.
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const instance = new Lenis({ lerp: 0.11, anchors: true, autoRaf: true });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- publishing an external instance
    setLenis(instance);
    return () => {
      instance.destroy();
      setLenis(null);
    };
  }, [reduce]);

  return (
    <MotionConfig reducedMotion="user">
      <LenisContext value={lenis}>
        <ScrollReset lenis={lenis} />
        {children}
      </LenisContext>
    </MotionConfig>
  );
}
