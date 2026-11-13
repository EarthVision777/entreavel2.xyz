"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useApp, toast } from "@/components/app-provider";
import { t } from "@/lib/i18n";
import { isIos, readableOn } from "@/lib/media";

export default function LoginPage() {
  const { config, theme, login, isAuthenticated, loading } = useApp();
  const router = useRouter();
  const [iosOpen, setIosOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const dark = theme === "dark";

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      router.replace("/");
      return;
    }
    let active = true;
    login()
      .then(() => {
        if (active) router.replace("/");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setFailed(true);
        toast.error(error instanceof Error ? error.message : t("error_login"));
      });
    return () => {
      active = false;
    };
  }, [loading, isAuthenticated, login, router]);

  const buttonColor = config.loginButtonColor;
  const buttonText = readableOn(buttonColor) ? "#ffffff" : "#111827";

  return (
    <div
      className={`flex min-h-screen items-center justify-center p-4 ${dark ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-blue-50 to-blue-100"}`}
    >
      <div
        className={`relative w-full max-w-md space-y-6 rounded-2xl p-8 shadow-xl backdrop-blur-lg ${dark ? "bg-gray-800/90" : "bg-white/80"}`}
      >
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
        <div className="flex flex-col items-center space-y-4">
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
            {failed ? t("error_login") : t("entering")}
          </p>
        </div>
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
