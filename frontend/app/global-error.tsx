"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale =
    typeof document !== "undefined" && document.cookie.includes("naviq_locale=uz")
      ? "uz"
      : "ru";
  const copy = locale === "uz"
    ? {
        title: "Kritik UI xato",
        desc: "Ilova tiklab bo'lmaydigan render xatosiga uchradi.",
        retry: "Yana urinish",
      }
    : {
        title: "Критическая ошибка UI",
        desc: "Приложение столкнулось с неустранимой ошибкой рендера.",
        retry: "Попробовать снова",
      };

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#050505] text-zinc-100">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="font-space text-3xl">{copy.title}</h1>
          <p className="text-sm text-zinc-400">{copy.desc}</p>
          <Button onClick={() => reset()}>{copy.retry}</Button>
        </main>
      </body>
    </html>
  );
}
