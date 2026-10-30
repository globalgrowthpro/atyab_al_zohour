import { useCallback, useEffect, type CSSProperties } from "react";
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export type AdminTheme = "dark" | "light";

const STORAGE_KEY = "atyab:admin-theme";
const THEME_CLASS = "admin-dark";

let current: AdminTheme = "dark";
if (typeof window !== "undefined") {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") current = saved;
  } catch {
    /* storage unavailable — keep the default */
  }
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function applyAdminThemeClass() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle(THEME_CLASS, current === "dark");
}

// Apply the saved theme before first paint of the panels.
if (typeof document !== "undefined") applyAdminThemeClass();

export function useAdminTheme() {
  const theme = useSyncExternalStore(subscribe, () => current, () => "dark" as AdminTheme);
  const setTheme = useCallback((next: AdminTheme) => {
    current = next;
    applyAdminThemeClass();
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    listeners.forEach((listener) => listener());
  }, []);
  const toggle = useCallback(() => setTheme(current === "dark" ? "light" : "dark"), [setTheme]);
  return [theme, setTheme, toggle] as const;
}

/** Adds/removes the dark class on <html> while a management panel is mounted. */
export function useAdminThemeClass() {
  const [theme] = useAdminTheme();
  useEffect(() => {
    applyAdminThemeClass();
    return () => {
      if (typeof document !== "undefined") document.documentElement.classList.remove(THEME_CLASS);
    };
  }, [theme]);
}

/** Theme-aware colors for Recharts, which needs concrete color strings. */
export function useChartTheme() {
  const [theme] = useAdminTheme();
  const dark = theme === "dark";
  const tooltip: CSSProperties = {
    borderRadius: 12,
    border: dark ? "1px solid rgba(255,255,255,0.14)" : "1px solid #E5E7EB",
    backgroundColor: dark ? "rgba(9, 30, 23, 0.96)" : "#FFFFFF",
    color: dark ? "#EAF3EE" : "#2E2E2E",
    fontFamily: "Tajawal",
  };
  return {
    dark,
    grid: dark ? "rgba(255,255,255,0.12)" : "#E5E7EB",
    tick: dark ? "#9DB4AA" : "#6B7280",
    tickStrong: dark ? "#C7D6CE" : "#374151",
    tooltip,
    pieColors: dark
      ? ["#5BC894", "#F0769A", "#E7C55C", "#7FBFA0", "#3E9E6F", "#E86A8E", "#C9B56A"]
      : ["#0B4D33", "#E7547A", "#D4AF37", "#4E8F6E", "#063321", "#B23A5E", "#8A7A3A"],
    line: dark ? "#5BC894" : "#0B4D33",
    rose: "#E7547A",
    sage: dark ? "#7FBFA0" : "#4E8F6E",
  };
}

/** Light/dark switch styled for the dark panel headers. */
export function ThemeToggle() {
  const [theme, , toggle] = useAdminTheme();
  const dark = theme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
      title={dark ? "الوضع الفاتح" : "الوضع الداكن"}
      className="rounded-xl text-white/80 hover:bg-white/10 hover:text-white"
      onClick={toggle}
    >
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}
