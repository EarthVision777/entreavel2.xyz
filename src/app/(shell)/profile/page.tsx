"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp, toast } from "@/components/app-provider";
import { api } from "@/lib/api";
import { t } from "@/lib/i18n";

const updatedKey = "llama.updated";

export default function ProfilePage() {
  const { theme, user, logout, setUser } = useApp();
  const router = useRouter();
  const dark = theme === "dark";
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(updatedKey) === "1") {
        sessionStorage.removeItem(updatedKey);
        setUpdated(true);
      }
    } catch {
      setUpdated(false);
    }
  }, []);

  useEffect(() => {
    if (!updated) return;
    const timer = setTimeout(() => setUpdated(false), 4000);
    return () => clearTimeout(timer);
  }, [updated]);

  if (!user) return null;
  const letter = (user.name || user.email).charAt(0).toUpperCase();

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      setUser(await api.updateName(name.trim()));
      setEditing(false);
      toast.success(t("name_updated_successfully"));
    } catch {
      toast.error(t("error_updating_name"));
    } finally {
      setSaving(false);
    }
  }

  async function refreshApp() {
    if (updating) return;
    setUpdating(true);
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
    } catch {
      // Reloading still picks up the latest files.
    }
    try {
      sessionStorage.setItem(updatedKey, "1");
    } catch {
      // The banner is optional if storage is blocked.
    }
    await new Promise((resolve) => setTimeout(resolve, 600));
    window.location.replace(`${window.location.pathname}?u=${Date.now()}`);
  }

  return (
    <div className="py-4">
      {updated ? (
        <div
          role="status"
          className="mb-4 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-md"
        >
          <Check className="h-5 w-5" />
          {t("app_updated")}
        </div>
      ) : null}
      <div className={`rounded-2xl p-8 shadow-md ${dark ? "bg-gray-800" : "bg-white"}`}>
        <div className="mb-8 flex items-center justify-between gap-3">
          <h1 className={`text-2xl font-bold ${dark ? "text-gray-100" : "text-black"}`}>
            {t("your_profile")}
          </h1>
          <Button
            variant="ghost"
            className="h-auto px-3 py-2 text-red-500 hover:bg-red-950/30 hover:text-red-400"
            onClick={() => {
              logout();
              router.replace("/");
            }}
          >
            <LogOut />
            {t("logout")}
          </Button>
        </div>
        <div className="mb-8 flex justify-center">
          <div className="avatar-container flex h-32 w-32 items-center justify-center rounded-full">
            <span className="text-4xl text-gray-400">{letter}</span>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <label className={`mb-1 block text-sm font-medium ${dark ? "text-gray-300" : "text-gray-500"}`}>
              {t("name")}
            </label>
            {editing ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t("enter_profile_name")}
                  className={`h-10 ${dark ? "border-gray-600 bg-gray-700 text-gray-100" : ""}`}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={save}
                    disabled={saving || !name.trim()}
                    className="h-auto bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    {saving ? t("saving") : t("save")}
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-auto"
                    onClick={() => {
                      setEditing(false);
                      setName("");
                    }}
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className={`text-lg font-medium ${dark ? "text-gray-100" : "text-gray-900"}`}>
                  {user.name || t("name_not_defined")}
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-500"
                  onClick={() => {
                    setName(user.name || "");
                    setEditing(true);
                  }}
                >
                  {t("edit")}
                </button>
              </div>
            )}
          </div>
          <div>
            <div className={`mb-1 text-sm font-medium ${dark ? "text-gray-300" : "text-gray-500"}`}>
              {t("email")}
            </div>
            <div className={`text-lg font-medium ${dark ? "text-gray-100" : "text-gray-900"}`}>
              {user.email}
            </div>
          </div>
          <div className={`border-t pt-6 ${dark ? "border-gray-700" : "border-gray-200"}`}>
            <Button
              variant="secondary"
              disabled={updating}
              onClick={refreshApp}
              className={`h-auto w-full py-3 ${dark ? "bg-gray-700 text-gray-100 hover:bg-gray-600" : ""}`}
            >
              <RefreshCw className={updating ? "animate-spin" : ""} />
              {updating ? t("updating_app") : t("update_app")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
