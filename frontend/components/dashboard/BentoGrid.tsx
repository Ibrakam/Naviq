import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function BentoGrid({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("grid grid-cols-1 gap-4 lg:grid-cols-4", className)}>{children}</div>;
}

export function BentoItem({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl", className)}>
      {children}
    </div>
  );
}
