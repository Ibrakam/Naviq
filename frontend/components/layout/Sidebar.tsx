"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Compass,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Settings2,
  Shield,
  Trophy,
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
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { t } = useT();
  const hasSkillProfile = hasCompletedSkillProfile(user?.skill_profile);

  const appLinks = [
    { href: "/dashboard", label: t("sidebar.dashboard"), icon: LayoutDashboard },
    ...(hasSkillProfile ? [] : [{ href: "/assessment", label: t("sidebar.assessment"), icon: ListChecks }]),
    { href: "/courses", label: t("sidebar.courses"), icon: BookOpen },
    { href: "/simulations", label: t("sidebar.simulations"), icon: FlaskConical },
    { href: "/professions", label: t("sidebar.professions"), icon: BriefcaseBusiness },
    { href: "/roadmap", label: t("sidebar.roadmap"), icon: Compass },
    { href: "/profile", label: t("sidebar.profile"), icon: Settings2 },
  ];

  const links = admin ? adminLinks : appLinks;

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#070B16]/70 p-4 backdrop-blur-xl lg:block">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="h-8 w-8 rounded-lg bg-[linear-gradient(135deg,#00F2FF,#CCFF00)]" />
        <span className="font-space text-lg font-semibold tracking-tight text-white">Naviq</span>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                active
                  ? "bg-cyan-300/15 text-cyan-200"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
