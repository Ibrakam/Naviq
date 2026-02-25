"use client";

import { motion } from "framer-motion";
import { useT } from "@/hooks/useT";

const nodes = [
  { x: 12, y: 24 },
  { x: 38, y: 10 },
  { x: 62, y: 22 },
  { x: 84, y: 8 },
  { x: 90, y: 36 },
  { x: 58, y: 44 },
  { x: 28, y: 40 },
];

export function NeuralLoader() {
  const { t } = useT();
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <svg width="120" height="60" viewBox="0 0 100 50" className="overflow-visible">
        {nodes.map((node, i) => {
          const next = nodes[(i + 1) % nodes.length];
          return (
            <motion.line
              key={`line-${i}`}
              x1={node.x}
              y1={node.y}
              x2={next.x}
              y2={next.y}
              stroke="rgba(0,242,255,0.4)"
              strokeWidth="1"
              initial={{ pathLength: 0.2, opacity: 0.2 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5, delay: i * 0.08 }}
            />
          );
        })}
        {nodes.map((node, i) => (
          <motion.circle
            key={`node-${i}`}
            cx={node.x}
            cy={node.y}
            r="2.5"
            fill="#00F2FF"
            animate={{ r: [2, 3.5, 2], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.07 }}
          />
        ))}
      </svg>
      <p className="text-xs text-zinc-400">{t("app.generatingTrajectory")}</p>
    </div>
  );
}
