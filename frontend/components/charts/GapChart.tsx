"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function GapChart({ gaps }: { gaps: Record<string, number> }) {
  const data = Object.entries(gaps)
    .map(([skill, value]) => ({
      skill: skill.replaceAll("_", " "),
      gap: Number(value),
    }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 8);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <XAxis type="number" stroke="rgba(255,255,255,0.25)" tick={{ fill: "#a1a1aa" }} />
          <YAxis
            dataKey="skill"
            type="category"
            width={110}
            stroke="rgba(255,255,255,0.25)"
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
          />
          <Tooltip contentStyle={{ background: "#0A0F1E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
          <Bar dataKey="gap" fill="url(#gapGradient)" radius={8} />
          <defs>
            <linearGradient id="gapGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00F2FF" />
              <stop offset="100%" stopColor="#CCFF00" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
