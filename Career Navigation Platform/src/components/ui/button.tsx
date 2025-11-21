import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-[0_10px_30px_rgba(101,85,255,0.2)]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#6555ff] via-[#5972ff] to-[#4fb5ff] text-white hover:opacity-95",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 shadow-none",
        outline:
          "border border-[#dce2ff] bg-white/80 text-foreground hover:border-[#7b61ff] hover:text-[#7b61ff] shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-[#e2e6f5]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 shadow-none",
        link: "text-primary underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "h-11 px-5 py-2 has-[>svg]:px-4",
        sm: "h-9 rounded-lg gap-1.5 px-3.5 has-[>svg]:px-3",
        lg: "h-12 rounded-xl px-6 has-[>svg]:px-5 text-base",
        icon: "size-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
