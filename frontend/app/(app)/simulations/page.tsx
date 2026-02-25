"use client";

import Link from "next/link";
import { useEffect } from "react";
import { FlaskConical, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/hooks/useT";
import { useSimulationStore } from "@/stores/simulationStore";

export default function SimulationsPage() {
  const { t } = useT();
  const simulations = useSimulationStore((s) => s.simulations);
  const fetchSimulations = useSimulationStore((s) => s.fetchSimulations);

  useEffect(() => {
    fetchSimulations().catch(() => undefined);
  }, [fetchSimulations]);

  return (
    <div className="space-y-4">
      <h2 className="font-space text-2xl font-semibold">{t("simulationsPage.title")}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {simulations.map((simulation) => (
          <Card key={simulation.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-cyan-300" />
                {simulation.title}
              </CardTitle>
              <CardDescription>{simulation.description || t("simulationsPage.cardDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/simulations/${simulation.id}`}>
                  <PlayCircle className="h-4 w-4" />
                  {t("simulationsPage.enterLab")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
