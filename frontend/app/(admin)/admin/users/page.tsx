"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import type { UserOut } from "@/types/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserOut[]>([]);
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const limit = 20;

  const load = async () => {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (search) params.set("search", search);
    const data = await api.get<UserOut[]>(`/admin/users?${params.toString()}`);
    setUsers(data);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, [skip]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name/email"
          className="max-w-sm"
        />
        <Button onClick={() => load().catch(() => undefined)}>Search</Button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>XP</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{String(user.role).toUpperCase()}</TableCell>
                <TableCell>{user.xp}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await api.patch<UserOut>(`/admin/users/${user.id}`, {
                            role: String(user.role).toLowerCase() === "admin" ? "student" : "admin",
                          });
                          await load();
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Role update failed");
                        }
                      }}
                    >
                      Toggle role
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        try {
                          await api.patch<UserOut>(`/admin/users/${user.id}`, { xp: user.xp + 100 });
                          await load();
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "XP update failed");
                        }
                      }}
                    >
                      +100 XP
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" disabled={skip === 0} onClick={() => setSkip((v) => Math.max(0, v - limit))}>
          Prev
        </Button>
        <Button variant="outline" onClick={() => setSkip((v) => v + limit)}>
          Next
        </Button>
      </div>
    </div>
  );
}
