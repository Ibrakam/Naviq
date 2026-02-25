"use client";

import { useMemo } from "react";
import { Bell, Languages, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { XPProgressBar } from "@/components/dashboard/XPProgressBar";
import { useAuthStore } from "@/stores/authStore";
import { useGamificationStore } from "@/stores/gamificationStore";
import { useT } from "@/hooks/useT";

export function TopBar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { locale, setLocale, t } = useT();
  const profile = useGamificationStore((s) => s.profile);
  const levels = useGamificationStore((s) => s.levels);

  const levelProgress = useMemo(() => {
    if (!profile || !levels.length) return 0;
    const current = levels.find((item) => item.level === profile.level);
    if (!current) return 0;
    const next = levels.find((item) => item.level === profile.level + 1);
    if (!next) return 100;
    const diff = Math.max(1, next.xp_min - current.xp_min);
    const value = ((profile.xp - current.xp_min) / diff) * 100;
    return Math.max(0, Math.min(100, value));
  }, [levels, profile]);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050505]/80 px-4 py-3 backdrop-blur-xl md:px-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-400">{t("topbar.welcomeBack")}</p>
          <h1 className="font-space text-lg font-semibold text-zinc-100">{user?.full_name ?? t("topbar.explorer")}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setLocale(locale === "ru" ? "uz" : "ru")}>
            <Languages className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            {t("topbar.logout")}
          </Button>
        </div>
      </div>

      <XPProgressBar
        xp={profile?.xp ?? user?.xp ?? 0}
        level={profile?.level}
        rankTitle={profile?.rank_title}
        progress={profile && levels.length ? levelProgress : undefined}
      />
    </header>
  );
}
