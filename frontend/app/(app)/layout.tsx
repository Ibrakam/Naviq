import type { ReactNode } from "react";
import { GhostMentor } from "@/components/gamification/GhostMentor";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="obsidian-shell flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 px-5 py-5 md:px-8 md:py-6">{children}</main>
        <GhostMentor />
      </div>
    </div>
  );
}
