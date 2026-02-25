"use client";

import { useEffect, useMemo, useState } from "react";
import { HeatMap } from "@/components/charts/HeatMap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function AdminDashboardPage() {
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});
  const [conversion, setConversion] = useState<{ registered: number; tested: number; generated_path: number } | null>(null);
  const [topCareers, setTopCareers] = useState<Array<{ profession: string; count: number }>>([]);
  const [dropoff, setDropoff] = useState<Array<{ simulation_id: string; dropoff_rate: number }>>([]);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<Record<string, number>>("/admin/analytics/skill-heatmap"),
      api.get<{ registered: number; tested: number; generated_path: number }>("/admin/analytics/conversion"),
      api.get<Array<{ profession: string; count: number }>>("/admin/analytics/top-careers"),
      api.get<Array<{ simulation_id: string; dropoff_rate: number }>>("/admin/analytics/dropoff"),
    ])
      .then(([h, c, t, d]) => {
        setHeatmap(h);
        setConversion(c);
        setTopCareers(t);
        setDropoff(d);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const line = `[${new Date().toLocaleTimeString()}] analytics pulse ${Math.random().toString(16).slice(2, 7)}`;
      setLogs((prev) => [...prev.slice(-7), line]);
    }, 1600);
    return () => clearInterval(timer);
  }, []);

  const conversionRate = useMemo(() => {
    if (!conversion || conversion.registered === 0) return 0;
    return Math.round((conversion.generated_path / conversion.registered) * 100);
  }, [conversion]);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Skill Heatmap</CardTitle>
          <CardDescription>Talent intensity across tracked skills</CardDescription>
        </CardHeader>
        <CardContent>
          <HeatMap data={heatmap} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-300">
          <p>Registered: {conversion?.registered ?? 0}</p>
          <p>Tested: {conversion?.tested ?? 0}</p>
          <p>Generated path: {conversion?.generated_path ?? 0}</p>
          <p className="text-lime-300">Overall conversion: {conversionRate}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Careers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topCareers.map((career) => (
            <div key={career.profession} className="flex items-center justify-between text-sm text-zinc-300">
              <span>{career.profession}</span>
              <span>{career.count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Simulation Dropoff</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-300">
          {dropoff.map((item) => (
            <div key={item.simulation_id} className="flex items-center justify-between">
              <span className="line-clamp-1 max-w-[14rem]">{item.simulation_id}</span>
              <span>{Math.round(item.dropoff_rate * 100)}%</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle>Live Logs</CardTitle>
          <CardDescription>Terminal-style stream (polling feel)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-44 overflow-y-auto rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-xs text-lime-300">
            {logs.map((log, index) => (
              <p key={`${log}-${index}`}>{log}</p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
