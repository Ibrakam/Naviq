"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { SimulationOut } from "@/types/api";
import { formatSimulationValidationIssues, simulationStepsDraftSchema } from "@/lib/simulation-contract";

export default function AdminSimulationDetailPage() {
  const params = useParams<{ id: string }>();
  const simulationId = params.id;

  const [simulation, setSimulation] = useState<SimulationOut | null>(null);
  const [stepsJson, setStepsJson] = useState("[]");
  const [validationReport, setValidationReport] = useState<string[]>([]);

  useEffect(() => {
    api.get<SimulationOut>(`/admin/simulations/${simulationId}`).then((data) => {
      setSimulation(data);
      setStepsJson(JSON.stringify(data.steps, null, 2));
    });
  }, [simulationId]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{simulation?.title ?? "Simulation"}</CardTitle>
          <CardDescription>JSON step builder</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={stepsJson} onChange={(e) => setStepsJson(e.target.value)} className="min-h-[50vh] font-mono text-xs" />
          <Button
            onClick={async () => {
              try {
                const parsedJson = JSON.parse(stepsJson) as unknown;
                const validated = simulationStepsDraftSchema.safeParse(parsedJson);

                if (!validated.success) {
                  const issues = formatSimulationValidationIssues(validated.error.issues);
                  setValidationReport(issues);
                  toast.error(`Invalid schema. ${issues[0]}`);
                  return;
                }

                const summary = validated.data.reduce(
                  (acc, step) => {
                    acc[step.type] += 1;
                    return acc;
                  },
                  { question: 0, task: 0, dialog: 0 },
                );

                setValidationReport([
                  `Total steps: ${validated.data.length}`,
                  `question: ${summary.question}`,
                  `task: ${summary.task}`,
                  `dialog: ${summary.dialog}`,
                  "Schema validation passed.",
                ]);

                await api.patch<SimulationOut>(`/admin/simulations/${simulationId}`, {
                  // Backend currently does not support steps patch; keep title/active update only.
                  title: simulation?.title,
                  is_active: simulation?.is_active,
                });
                toast.success(`Validated ${validated.data.length} steps locally.`);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Invalid JSON");
              }
            }}
          >
            Validate & Save
          </Button>
          {validationReport.length ? (
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="mb-2 text-xs font-semibold text-zinc-300">Validation Report</p>
              <ul className="space-y-1 text-xs text-zinc-400">
                {validationReport.map((line) => (
                  <li key={line}>• {line}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
