"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import type { UniversityOut } from "@/types/api";

export default function AdminUniversitiesPage() {
  const [items, setItems] = useState<UniversityOut[]>([]);
  const [name, setName] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [region, setRegion] = useState("");

  const load = async () => {
    const data = await api.get<UniversityOut[]>("/admin/universities");
    setItems(data);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add University</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Input placeholder="University name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Short code" value={shortCode} onChange={(e) => setShortCode(e.target.value)} />
          <Input placeholder="Region" value={region} onChange={(e) => setRegion(e.target.value)} />
          <Button
            disabled={!name.trim() || !shortCode.trim()}
            onClick={async () => {
              try {
                await api.post<UniversityOut>("/admin/universities", {
                  name: name.trim(),
                  short_code: shortCode.trim(),
                  region: region.trim() || null,
                  is_active: true,
                });
                setName("");
                setShortCode("");
                setRegion("");
                await load();
                toast.success("University created");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Create failed");
              }
            }}
          >
            Create
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Universities</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.short_code}</TableCell>
                  <TableCell>{item.region || "-"}</TableCell>
                  <TableCell>{item.is_active ? "Active" : "Disabled"}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await api.patch(`/admin/universities/${item.id}`, { is_active: !item.is_active });
                          await load();
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Update failed");
                        }
                      }}
                    >
                      Toggle
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
