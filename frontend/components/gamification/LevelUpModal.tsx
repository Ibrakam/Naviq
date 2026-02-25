"use client";

import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/hooks/useT";

export function LevelUpModal({
  open,
  onOpenChange,
  level,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: number;
  title: string;
}) {
  const { t } = useT();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-cyan-300/25 bg-[#04070f]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(0,242,255,0.28),rgba(4,7,15,0))]" />
        <DialogHeader className="relative">
          <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            {t("gamification.levelUp")}
          </div>
          <DialogTitle className="font-space text-2xl">{t("app.level")} {level}</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
