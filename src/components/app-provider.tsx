"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Toaster, toast } from "sonner";
import {
  api,
  clearSession,
  readSession,
  writeSession,
  type Session,
} from "@/lib/api";
import { appConfig } from "@/lib/config";
import type { SessionUser } from "@/lib/types";

type Theme = "dark" | "light";

type AppContextValue = {
  config: typeof appConfig;
  theme: Theme;
  user: SessionUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  setUser: (user: SessionUser) => void;
};

const AppContext = createContext<AppContextValue | null>(null);
const themeKey = "llama.theme";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(appConfig.theme);
  const [user, setUserState] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(themeKey);
      if (stored === "dark" || stored === "light") setTheme(stored);
      setUserState(readSession()?.user ?? null);
    } catch {
      setUserState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark-theme", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }
  }, []);

  const login = useCallback(async (email: string) => {
    const session: Session = await api.login(email);
    writeSession(session);
    setUserState(session.user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUserState(null);
  }, []);

  const setUser = useCallback((next: SessionUser) => {
    const session = readSession();
    if (session) writeSession({ ...session, user: next });
    setUserState(next);
  }, []);

  const value = useMemo(
    () => ({
      config: appConfig,
      theme,
      user,
      isAuthenticated: user !== null,
      loading,
      login,
      logout,
      setUser,
    }),
    [theme, user, loading, login, logout, setUser],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <Toaster
        theme={theme}
        position="top-center"
        toastOptions={{ duration: 2800 }}
      />
    </AppContext.Provider>
  );
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}

export { toast };
