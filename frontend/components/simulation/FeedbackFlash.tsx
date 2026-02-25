"use client";

import { motion } from "framer-motion";

export function FeedbackFlash({ state }: { state: "idle" | "success" | "error" }) {
  if (state === "idle") return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={
        state === "success"
          ? "pointer-events-none absolute inset-0 rounded-2xl border border-lime-300/50 bg-[radial-gradient(circle_at_top,rgba(204,255,0,0.2),transparent_65%)]"
          : "pointer-events-none absolute inset-0 rounded-2xl border border-rose-400/50 bg-[radial-gradient(circle_at_top,rgba(255,107,107,0.2),transparent_65%)]"
      }
    />
  );
}
