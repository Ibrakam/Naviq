"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Map,
  Route,
  Settings2,
  Shield,
  Trophy,
  User,
} from "lucide-react";
import { hasCompletedSkillProfile } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";
import { useAuthStore } from "@/stores/authStore";

const adminLinks = [
  { href: "/admin/dashboard", label: "Analytics", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Shield },
  { href: "/admin/simulations", label: "Simulations", icon: FlaskConical },
  { href: "/admin/courses", label: "Courses", icon: BriefcaseBusiness },
  { href: "/admin/universities", label: "Universities", icon: GraduationCap },
  { href: "/admin/gamification", label: "Gamification", icon: Trophy },
  { href: "/admin/prompts", label: "Prompts", icon: Settings2 },
];

export function Sidebar({ admin = false }: { admin?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { t } = useT();
  const hasSkillProfile = hasCompletedSkillProfile(user?.skill_profile);

  const appLinks = [
    { href: "/dashboard", label: t("sidebar.dashboard"), icon: LayoutDashboard },
    ...(hasSkillProfile ? [] : [{ href: "/assessment", label: t("sidebar.assessment"), icon: ListChecks }]),
    { href: "/professions", label: "Career Path", icon: Route },
    { href: "/simulations", label: t("sidebar.simulations"), icon: FlaskConical },
    { href: "/courses", label: "Skills", icon: BrainCircuit },
    { href: "/roadmap", label: t("sidebar.roadmap"), icon: Map },
    { href: "/profile", label: t("sidebar.profile"), icon: User },
  ];

  const links = admin ? adminLinks : appLinks;

  return (
    <aside className="obsidian-panel hidden h-screen w-72 shrink-0 flex-col px-7 py-9 lg:flex">
      <div className="mb-12 px-1">
        <p className="text-[3rem] font-black tracking-[-0.05em] text-[#72a6ff]">Naviq</p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.38em] text-[#7d86ad]">Elite Career Intelligence</p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium tracking-[-0.02em] transition-all duration-300",
                active
                  ? "bg-[#112153] text-[#7fb0ff]"
                  : "text-[#9aa4ca] hover:bg-[#0d1a48] hover:text-[#e1e4ff]",
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", active ? "text-[#7fb0ff]" : "text-[#b5bdd7]")} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 pt-8">
        {!admin ? (
          <button
            type="button"
            className="w-full rounded-2xl bg-[linear-gradient(135deg,#8db3ff,#6c9fff)] px-4 py-3.5 text-sm font-bold text-[#001d4f] transition-transform hover:translate-y-[-1px]"
          >
            Upgrade to Pro
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[#8d97c0] transition-colors hover:bg-[#0d1a48] hover:text-[#e1e4ff]"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
