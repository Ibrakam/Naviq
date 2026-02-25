import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary/40 bg-primary/20 text-cyan-100",
        secondary: "border-secondary/40 bg-secondary/20 text-zinc-200",
        destructive: "border-destructive/40 bg-destructive/20 text-rose-100",
        outline: "text-foreground",
        lime: "border-lime-300/40 bg-lime-300/15 text-lime-200",
        muted: "border-white/20 bg-white/10 text-zinc-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
