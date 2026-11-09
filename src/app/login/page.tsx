"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useApp, toast } from "@/components/app-provider";
import { ApiError } from "@/lib/api";
import { t } from "@/lib/i18n";
import { isIos, readableOn } from "@/lib/media";

export default function LoginPage() {
  const { config, theme, login, isAuthenticated, loading } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [iosOpen, setIosOpen] = useState(false);
  const dark = theme === "dark";

  useEffect(() => {
    if (!loading && isAuthenticated) router.replace("/");
  }, [loading, isAuthenticated, router]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) {
      toast.error(t("please_enter_email"));
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim());
      router.replace("/");
    } catch (error) {
      const message =
        error instanceof ApiError && error.status === 401
          ? error.message
          : error instanceof ApiError
            ? error.message
            : t("error_login");
      toast.error(message);
      setSubmitting(false);
    }
  }

  const buttonColor = config.loginButtonColor;
  const buttonText = readableOn(buttonColor) ? "#ffffff" : "#111827";

  return (
    <div
      className={`flex min-h-screen items-center justify-center p-4 ${dark ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-blue-50 to-blue-100"}`}
    >
      <div
        className={`relative w-full max-w-md space-y-6 rounded-2xl p-8 shadow-xl backdrop-blur-lg ${dark ? "bg-gray-800/90" : "bg-white/80"}`}
      >
        <form onSubmit={onSubmit} className="space-y-6">
          {isIos() ? (
            <div className="flex justify-center">
              <Button
                type="button"
                onClick={() => setIosOpen(true)}
                className="h-auto gap-2 px-4 py-2"
                style={{ backgroundColor: buttonColor, color: buttonText }}
              >
                <Download />
                {t("install_app")}
              </Button>
            </div>
          ) : null}
          <div className="mb-8 flex flex-col items-center space-y-4">
            <img
              src={config.logoUrl}
              alt="Logo"
              className="h-24 w-24 rounded-xl object-contain shadow-sm"
            />
            <h1
              className="text-center text-2xl font-bold"
              style={{ color: config.appNameColor }}
            >
              {config.name}
            </h1>
            <p className={dark ? "text-gray-300" : "text-gray-500"}>
              {t("access_your_account")}
            </p>
          </div>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("enter_your_email")}
              className={`h-11 pl-10 ${dark ? "border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-500" : "bg-white/70"}`}
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="h-auto w-full py-3 text-base"
            style={{ backgroundColor: buttonColor, color: buttonText }}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-3">
                <span className="h-5 w-5 animate-spin rounded-full border-b-2 border-current" />
                {t("entering")}
              </span>
            ) : (
              t("enter")
            )}
          </Button>
          <p className={`text-center text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {t("login_hint")}
          </p>
        </form>
      </div>
      <Dialog open={iosOpen} onOpenChange={setIosOpen}>
        <DialogContent className="max-w-[300px]">
          <DialogTitle>{t("install_app_ios")}</DialogTitle>
          <ol className="space-y-3 text-sm">
            <li>1. {t("ios_install_step1")}</li>
            <li>2. {t("ios_install_step2")}</li>
            <li>3. {t("ios_install_step3")}</li>
          </ol>
        </DialogContent>
      </Dialog>
    </div>
  );
}
