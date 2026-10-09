"use client";

import { motion } from "motion/react";
import { useEffect, type ReactNode } from "react";

// Set after the first client mount. The initial page load must render visible HTML:
// hiding it until hydration would hold back LCP by the whole JS boot time.
let hydrated = false;

/** Re-mounts on every navigation: a soft fade-up between pages (skipped on first load). */
export default function Template({ children }: { children: ReactNode }) {
  useEffect(() => {
    hydrated = true;
  }, []);

  return (
    <motion.div
      initial={hydrated ? { opacity: 0, y: 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
