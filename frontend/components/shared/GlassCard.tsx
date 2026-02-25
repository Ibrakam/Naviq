import { cn } from "@/lib/utils";

export function GlassCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)]",
        className,
      )}
      {...props}
    />
  );
}
