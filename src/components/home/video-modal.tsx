"use client";

import { useScrollLock } from "../site/providers";
import { Play, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Portal } from "../ui/portal";

/** Play button that opens a YouTube embed in a full-screen modal. */
export function VideoButton({ videoId, label = "Tanıtım filmi" }: { videoId: string; label?: string }) {
  const [open, setOpen] = useState(false);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex h-12 items-center gap-3 rounded-full pl-1.5 pr-6 text-sm font-semibold text-white"
      >
        <span className="relative grid size-9 place-items-center rounded-full bg-white/15 backdrop-blur transition-colors group-hover:bg-white group-hover:text-navy">
          <span className="absolute inset-0 animate-ping rounded-full bg-white/20 [animation-duration:2.4s]" />
          <Play className="relative size-3.5 fill-current" />
        </span>
        <span className="link-underline">{label}</span>
      </button>

      <Portal>
        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 z-[60] grid place-items-center bg-navy/90 p-4 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-label={label}
            >
              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative aspect-video w-full max-w-6xl overflow-hidden rounded-3xl bg-black shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <iframe
                  className="absolute inset-0 size-full"
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
                  title={label}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </motion.div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Kapat"
                className="absolute right-5 top-5 grid size-12 place-items-center rounded-full bg-white/10 text-white transition-transform hover:rotate-90 hover:bg-white hover:text-navy"
              >
                <X className="size-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
