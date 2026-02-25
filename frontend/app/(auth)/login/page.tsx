"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/hooks/useT";
import { useAuthStore } from "@/stores/authStore";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { t } = useT();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.isLoading);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values);
      toast.success(t("auth.welcomeBack"));
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.loginFailed"));
    }
  };

  return (
    <AuthShell title={t("auth.loginTitle")} subtitle={t("auth.loginSubtitle")}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("auth.loading") : t("auth.login")}
        </Button>
      </form>

      <p className="mt-4 text-sm text-zinc-400">
        {t("auth.noAccount")}{" "}
        <Link href="/register" className="text-cyan-300 hover:text-cyan-200">
          {t("auth.register")}
        </Link>
      </p>
    </AuthShell>
  );
}
