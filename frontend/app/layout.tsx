import type { Metadata } from "next";
import { CursorFollower } from "@/components/layout/CursorFollower";
import { PageTransition } from "@/components/layout/PageTransition";
import { AppProviders } from "@/components/providers/AppProviders";
import { getLocaleFromCookies } from "@/lib/i18n-server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Naviq Visual Oracle",
  description: "AI-powered career orientation platform",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocaleFromCookies();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-[#050505] text-zinc-100 antialiased">
        <AppProviders locale={locale}>
          <CursorFollower />
          <PageTransition>{children}</PageTransition>
        </AppProviders>
      </body>
    </html>
  );
}
