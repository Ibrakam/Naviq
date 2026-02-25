"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useT } from "@/hooks/useT";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type { UniversityOut } from "@/types/api";

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  university_id: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { locale, t } = useT();
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.isLoading);
  const [universities, setUniversities] = useState<UniversityOut[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: "", email: "", password: "", university_id: "" },
  });

  useEffect(() => {
    api
      .get<UniversityOut[]>("/gamification/universities", { auth: false })
      .then(setUniversities)
      .catch(() => setUniversities([]));
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      await register({
        ...values,
        timezone,
        university_id: values.university_id || null,
        preferred_language: locale,
      });
      toast.success(t("auth.accountCreated"));
      router.push("/assessment");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.registerFailed"));
    }
  };

  return (
    <AuthShell title={t("auth.registerTitle")} subtitle={t("auth.registerSubtitle")}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="full_name">{t("auth.fullName")}</Label>
          <Input id="full_name" {...form.register("full_name")} />
          <p className="text-xs text-rose-300">{form.formState.errors.full_name?.message}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input id="email" type="email" {...form.register("email")} />
          <p className="text-xs text-rose-300">{form.formState.errors.email?.message}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input id="password" type="password" {...form.register("password")} />
          <p className="text-xs text-rose-300">{form.formState.errors.password?.message}</p>
        </div>

        <div className="space-y-2">
          <Label>{t("auth.universityOptional")}</Label>
          <Select
            value={form.watch("university_id") || "none"}
            onValueChange={(value) => form.setValue("university_id", value === "none" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("auth.chooseUniversity")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t("auth.notSelected")}</SelectItem>
              {universities.map((uni) => (
                <SelectItem key={uni.id} value={uni.id}>
                  {uni.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full" variant="lime" disabled={loading}>
          {loading ? t("auth.loading") : t("auth.register")}
        </Button>
      </form>

      <p className="mt-4 text-sm text-zinc-400">
        {t("auth.haveAccount")}{" "}
        <Link href="/login" className="text-cyan-300 hover:text-cyan-200">
          {t("auth.login")}
        </Link>
      </p>
    </AuthShell>
  );
}
