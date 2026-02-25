"use client";

import { cn } from "@/lib/utils";

function cellColor(value: number) {
  if (value > 0.8) return "bg-lime-300/70";
  if (value > 0.6) return "bg-cyan-300/70";
  if (value > 0.4) return "bg-cyan-300/45";
  if (value > 0.2) return "bg-cyan-300/25";
  return "bg-white/10";
}

export function HeatMap({ data }: { data: Record<string, number> }) {
  const cells = Object.entries(data);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {cells.map(([name, value]) => (
        <div key={name} className={cn("rounded-xl border border-white/10 p-3", cellColor(value))}>
          <p className="text-xs uppercase tracking-wide text-zinc-900/80">{name.replaceAll("_", " ")}</p>
          <p className="text-lg font-semibold text-zinc-900">{Math.round(value * 100)}%</p>
        </div>
      ))}
    </div>
  );
}
