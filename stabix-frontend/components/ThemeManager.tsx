"use client";

import { useEffect } from "react";

export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "stabix-theme";

export function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;

  const shouldBeDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  root.classList.toggle("dark", shouldBeDark);
  root.style.colorScheme = shouldBeDark ? "dark" : "light";
}

export function getSavedTheme(): ThemeMode {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);

  if (
    saved === "light" ||
    saved === "dark" ||
    saved === "system"
  ) {
    return saved;
  }

  return "light";
}

export function saveTheme(theme: ThemeMode) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);

  window.dispatchEvent(
    new CustomEvent("stabix-theme-change", {
      detail: theme,
    })
  );
}

export default function ThemeManager() {
  useEffect(() => {
    const theme = getSavedTheme();

    applyTheme(theme);

    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<ThemeMode>;
      applyTheme(customEvent.detail);
    };

    window.addEventListener(
      "stabix-theme-change",
      handleThemeChange
    );

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleSystemThemeChange = () => {
      const currentTheme = getSavedTheme();

      if (currentTheme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange
    );

    return () => {
      window.removeEventListener(
        "stabix-theme-change",
        handleThemeChange
      );

      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange
      );
    };
  }, []);

  return null;
}