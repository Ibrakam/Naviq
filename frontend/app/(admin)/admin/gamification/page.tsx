"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";

type AdminAchievement = {
  key: string;
  name: string;
  rarity: string;
  season: number;
  is_active: boolean;
  reward_payload?: Record<string, unknown> | null;
};

export default function AdminGamificationPage() {
  const [rows, setRows] = useState<AdminAchievement[]>([]);

  const load = async () => {
    const data = await api.get<AdminAchievement[]>("/admin/gamification/achievements");
    setRows(data);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Season 1 Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Rarity</TableHead>
                <TableHead>Season</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.key}>
                  <TableCell className="font-mono text-xs">{row.key}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.rarity}</TableCell>
                  <TableCell>
                    <Input
                      className="w-20"
                      type="number"
                      min={1}
                      max={99}
                      value={row.season}
                      onChange={(e) => {
                        const season = Number(e.target.value || row.season);
                        setRows((prev) => prev.map((item) => (item.key === row.key ? { ...item, season } : item)));
                      }}
                    />
                  </TableCell>
                  <TableCell>{row.is_active ? "active" : "disabled"}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await api.put(`/admin/gamification/achievements/${row.key}`, {
                            season: row.season,
                            is_active: !row.is_active,
                          });
                          await load();
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Update failed");
                        }
                      }}
                    >
                      Toggle
                    </Button>
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          await api.put(`/admin/gamification/achievements/${row.key}`, {
                            season: row.season,
                            is_active: row.is_active,
                          });
                          toast.success("Saved");
                          await load();
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Save failed");
                        }
                      }}
                    >
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
