"use client";

import { Check, Share2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      await navigator.share({ title, url }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={share}
      className="group relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-full border border-line px-4 text-sm font-semibold transition-colors hover:border-deu hover:text-deu"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span key="ok" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} className="flex items-center gap-2 text-deu">
            <Check className="size-4" /> Bağlantı kopyalandı
          </motion.span>
        ) : (
          <motion.span key="share" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} className="flex items-center gap-2">
            <Share2 className="size-4 transition-transform group-hover:-rotate-12 group-hover:scale-110" /> Paylaş
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
