"use client";

import { Bell, Languages, Search, Settings2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useGamificationStore } from "@/stores/gamificationStore";
import { useT } from "@/hooks/useT";

export function TopBar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { locale, setLocale } = useT();
  const notifications = useGamificationStore((s) => s.notifications);

  const initials = (user?.full_name ?? "Naviq User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-4 px-5 py-4 backdrop-blur-xl md:px-8">
      <div className="obsidian-input flex h-12 flex-1 items-center gap-3 rounded-2xl px-4 text-[#a0a9d5] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <Search className="h-5 w-5 text-[#6f7dad]" />
        <input
          type="text"
          placeholder="Search insights, careers, or skills..."
          className="w-full bg-transparent text-[1.05rem] text-[#dbe3ff] outline-none placeholder:text-[#7381b3]"
        />
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          type="button"
          onClick={() => setLocale(locale === "ru" ? "uz" : "ru")}
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-[#a0a9d5] transition-colors hover:bg-[#112153] hover:text-[#e1e4ff]"
          aria-label="Change language"
        >
          <Languages className="h-5 w-5" />
        </button>

        <button
          type="button"
          className="relative flex h-11 w-11 items-center justify-center rounded-2xl text-[#a0a9d5] transition-colors hover:bg-[#112153] hover:text-[#e1e4ff]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {notifications.length ? <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#ff8b84]" /> : null}
        </button>

        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-[#a0a9d5] transition-colors hover:bg-[#112153] hover:text-[#e1e4ff]"
          aria-label="Open profile settings"
        >
          <Settings2 className="h-5 w-5" />
        </button>

        <Link
          href="/profile"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(133,173,255,0.25),rgba(108,159,255,0.38))] text-sm font-bold text-[#f7f9ff] shadow-[0_10px_30px_rgba(6,14,42,0.25)]"
        >
          {initials || "N"}
        </Link>
      </div>
    </header>
  );
}
