import type { ReactNode } from "react";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,242,255,0.16),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(204,255,0,0.12),transparent_40%)]" />
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0A0F1E]/75 p-6 backdrop-blur-xl">
        <h1 className="font-space text-2xl font-semibold text-zinc-100">{title}</h1>
        <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
