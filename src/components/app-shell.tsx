"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BellOff,
  Download,
  House,
  Megaphone,
  Phone,
  UserRound,
  Users,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useApp, toast } from "@/components/app-provider";
import { t } from "@/lib/i18n";
import { isIos, readableOn } from "@/lib/media";

type BeforeInstall = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const nav = [
  { href: "/", key: "home" as const, icon: House },
  { href: "/feed", key: "feed" as const, icon: Megaphone },
  { href: "/community", key: "community" as const, icon: Users },
  { href: "/profile", key: "profile" as const, icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { config, theme, user } = useApp();
  const pathname = usePathname();
  const [installEvent, setInstallEvent] = useState<BeforeInstall | null>(null);
  const [installed, setInstalled] = useState(false);
  const [iosOpen, setIosOpen] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(false);
  const dark = theme === "dark";

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    setInstalled(standalone);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      if (!standalone) setInstallEvent(event as BeforeInstall);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if (typeof Notification !== "undefined") {
      setNotificationsOn(Notification.permission === "granted");
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const items = useMemo(
    () => nav.filter((item) => item.key !== "community" || config.communityEnabled),
    [config.communityEnabled],
  );
  const active =
    items.find((item) => item.href !== "/" && pathname.startsWith(item.href))
      ?.key ?? "home";

  const iconColor =
    dark && config.bottomButtonsColor === "#000000"
      ? "#ffffff"
      : config.bottomButtonsColor;
  const headerText = readableOn(config.headerColor)
    ? "text-white"
    : "text-gray-800";

  async function install() {
    if (isIos()) {
      setIosOpen(true);
      return;
    }
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallEvent(null);
  }

  async function enableNotifications() {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsOn(true);
        toast.success(t("notifications_enabled"));
      }
      return;
    }
    toast.success(t("notifications_enabled"));
  }

  const showInstall = !installed && (installEvent !== null || isIos());

  return (
    <div className={`app-shell min-h-screen ${dark ? "bg-gray-900" : "bg-gray-50"}`}>
      <header
        style={{ backgroundColor: config.headerColor }}
        className="app-header fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-4 pb-4"
      >
        <Link href="/" className="overflow-hidden rounded-2xl shadow-lg">
          <img
            src={config.logoUrl}
            alt="Logo"
            className="h-12 w-12 object-contain"
          />
        </Link>
        <div className="flex items-center gap-1">
          {showInstall ? (
            <button
              type="button"
              onClick={install}
              title={t("install_app")}
              className={`rounded-full p-2 hover:bg-black/5 ${headerText}`}
            >
              <Download className="h-6 w-6" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={enableNotifications}
            title={t(notificationsOn ? "notifications_enabled" : "enable_notifications")}
            className={`rounded-full p-2 hover:bg-black/5 ${headerText}`}
          >
            {notificationsOn ? (
              <Bell className="h-6 w-6" />
            ) : (
              <BellOff className="h-6 w-6" />
            )}
          </button>
        </div>
      </header>
      <main className="app-main mx-auto w-full max-w-lg px-4 pb-24">{children}</main>
      {config.showSupportButton ? (
        <a
          href={`mailto:${config.supportEmail}?subject=${encodeURIComponent(`Soporte - ${config.name}`)}&body=${encodeURIComponent(user ? `\n\n---\n${user.name ?? ""} <${user.email}>` : "")}`}
          aria-label="Soporte"
          className="fixed right-6 z-40 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg transition-transform hover:scale-105"
          style={{ bottom: "calc(100px + var(--safe-bottom))" }}
        >
          <Phone className="h-8 w-8 text-blue-600" />
        </a>
      ) : null}
      <nav
        className={`app-nav fixed right-0 bottom-0 left-0 border-t ${dark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}
      >
        <div className="mx-auto flex max-w-lg justify-around">
          {items.map((item) => {
            const selected = active === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex flex-1 flex-col items-center px-2 py-3 ${dark ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}
              >
                <item.icon
                  className="h-6 w-6"
                  style={{ color: iconColor, opacity: selected ? 1 : 0.5 }}
                />
                <span
                  className="mt-1 text-sm"
                  style={{ color: iconColor, opacity: selected ? 1 : 0.5 }}
                >
                  {t(item.key)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
      <Dialog open={iosOpen} onOpenChange={setIosOpen}>
        <DialogContent className="max-w-[300px] bg-gray-800 text-gray-100">
          <DialogTitle className="pr-6 text-base">
            {t("install_app_ios")}
          </DialogTitle>
          <ol className="space-y-3">
            {(["ios_install_step1", "ios_install_step2", "ios_install_step3"] as const).map(
              (key, index) => (
                <li key={key} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-900 font-medium text-blue-300">
                    {index + 1}
                  </span>
                  {t(key)}
                </li>
              ),
            )}
          </ol>
        </DialogContent>
      </Dialog>
    </div>
  );
}
