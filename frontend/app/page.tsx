"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/useT";

export default function LandingPage() {
  const { t } = useT();
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,242,255,0.15),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(204,255,0,0.12),transparent_35%)]" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
          <Sparkles className="h-3.5 w-3.5" />
          {t("landingApp.badge")}
        </div>

        <h1 className="max-w-4xl font-space text-4xl leading-tight text-white md:text-6xl">
          {t("landingApp.title1")}
          <br />
          {t("landingApp.title2")}
        </h1>

        <p className="mt-6 max-w-2xl text-zinc-300">
          {t("landingApp.subtitle")}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/register">
              {t("landingApp.createAccount")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">{t("landingApp.login")}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
