"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Step = {
  title: string;
  completed?: boolean;
};

export function SVGPathJourney({ steps }: { steps: Step[] }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-6">
      <svg viewBox="0 0 1000 220" className="h-56 w-full">
        <defs>
          <linearGradient id="roadGlow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00F2FF" />
            <stop offset="100%" stopColor="#CCFF00" />
          </linearGradient>
        </defs>

        <motion.path
          d="M20 180 C 200 60, 400 220, 560 100 C 700 20, 840 140, 980 80"
          stroke="url(#roadGlow)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {steps.map((step, index) => {
          const x = 40 + (index * 920) / Math.max(1, steps.length - 1);
          const y = 160 - Math.sin(index * 1.1) * 45;

          return (
            <g key={`${step.title}-${index}`}>
              <circle
                cx={x}
                cy={y}
                r="12"
                className={cn(step.completed ? "fill-lime-300" : "fill-white/20")}
              />
              <text x={x} y={y + 32} textAnchor="middle" fill="rgba(255,255,255,0.82)" fontSize="11">
                {step.title}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_45%)]" />
    </div>
  );
}
