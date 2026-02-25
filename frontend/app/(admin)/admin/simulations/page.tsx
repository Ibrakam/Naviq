"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import type { ProfessionOut, SimulationOut } from "@/types/api";

export default function AdminSimulationsPage() {
  const [simulations, setSimulations] = useState<SimulationOut[]>([]);
  const [professions, setProfessions] = useState<ProfessionOut[]>([]);
  const [title, setTitle] = useState("");
  const [professionId, setProfessionId] = useState("");

  const load = async () => {
    const [sims, profs] = await Promise.all([
      api.get<SimulationOut[]>("/admin/simulations"),
      api.get<ProfessionOut[]>("/professions"),
    ]);
    setSimulations(sims);
    setProfessions(profs);
    if (!professionId && profs[0]) setProfessionId(profs[0].id);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <h3 className="mb-3 font-space text-lg">Create Simulation</h3>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Simulation title" />
          <select
            value={professionId}
            onChange={(e) => setProfessionId(e.target.value)}
            className="h-10 rounded-xl border border-white/15 bg-black/20 px-3 text-sm text-zinc-100"
          >
            {professions.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0A0F1E]">
                {p.title}
              </option>
            ))}
          </select>
          <Button
            onClick={async () => {
              try {
                await api.post<SimulationOut>("/admin/simulations", {
                  title,
                  profession_id: professionId,
                  is_active: true,
                  steps: [],
                });
                setTitle("");
                await load();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Create failed");
              }
            }}
          >
            Create
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Steps</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {simulations.map((simulation) => (
              <TableRow key={simulation.id}>
                <TableCell>{simulation.title}</TableCell>
                <TableCell>{simulation.is_active ? "Yes" : "No"}</TableCell>
                <TableCell>{simulation.steps.length}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/simulations/${simulation.id}`}>Edit</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={async () => {
                        try {
                          await api.delete<void>(`/admin/simulations/${simulation.id}`);
                          await load();
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Delete failed");
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
