"use client";

import { Check, Copy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const COLORS = [
  { name: "DEÜ Mavisi", pantone: "Pantone 301 C", hex: "#004B87", text: "text-white" },
  { name: "Lacivert", pantone: "Dijital koyu ton", hex: "#03182C", text: "text-white" },
  { name: "Altın", pantone: "Pantone 872 C", hex: "#8B6F4E", text: "text-white" },
  { name: "Gümüş", pantone: "Pantone Silver C", hex: "#A2A2A1", text: "text-ink" },
  { name: "Kâğıt", pantone: "Dijital zemin", hex: "#F5F3EE", text: "text-ink" },
];

/** Brand swatches; clicking copies the HEX value with a small confirmation. */
export function BrandColors() {
  const [copied, setCopied] = useState<string | null>(null);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {COLORS.map((c, i) => (
        <motion.button
          key={c.hex}
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(c.hex);
            setCopied(c.hex);
            setTimeout(() => setCopied(null), 1500);
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.07, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -8 }}
          whileTap={{ scale: 0.97 }}
          style={{ backgroundColor: c.hex }}
          className={`group relative flex aspect-[3/4] flex-col justify-between rounded-3xl border border-black/5 p-5 text-left ${c.text} ${i === 0 ? "col-span-2 sm:col-span-1" : ""}`}
        >
          <span className="flex items-center justify-between text-xs font-semibold opacity-70">
            {c.pantone}
            <AnimatePresence mode="wait" initial={false}>
              {copied === c.hex ? (
                <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Check className="size-4" />
                </motion.span>
              ) : (
                <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="opacity-0 transition-opacity group-hover:opacity-100">
                  <Copy className="size-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          <span>
            <span className="block text-lg font-semibold">{c.name}</span>
            <span className="font-mono text-sm opacity-80">{copied === c.hex ? "Kopyalandı!" : c.hex}</span>
          </span>
        </motion.button>
      ))}
    </div>
  );
}
