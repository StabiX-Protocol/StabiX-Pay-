"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getSavedTheme,
  saveTheme,
  type ThemeMode,
} from "@/components/ThemeManager";

const IconBox = ({
  children,
  gradient,
}: {
  children: React.ReactNode;
  gradient: string;
}) => (
  <div
    className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)] ring-1 ring-white/20 backdrop-blur-xl`}
  >
    <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
    {children}
  </div>
);

/* Premium Light Icon */
export const PremiumLightIcon = () => (
  <IconBox gradient="from-amber-200 via-yellow-400 to-orange-500 shadow-amber-500/30">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
    >
      <circle cx="12" cy="12" r="4" fill="white" />
      <path
        d="M12 2V4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 20V22"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4.93 4.93L6.34 6.34"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M17.66 17.66L19.07 19.07"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M2 12H4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 12H22"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4.93 19.07L6.34 17.66"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M17.66 6.34L19.07 4.93"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  </IconBox>
);

/* Premium Dark Icon */
export const PremiumDarkIcon = () => (
  <IconBox gradient="from-violet-600 via-indigo-600 to-slate-900 shadow-violet-600/30">
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
    >
      <path
        d="M20.5 14.5C19.4 15.1 18.1 15.45 16.75 15.45C12.25 15.45 8.55 11.75 8.55 7.25C8.55 5.9 8.9 4.6 9.5 3.5C5.65 4.55 2.85 8.1 2.85 12.3C2.85 17.2 6.8 21.15 11.7 21.15C15.9 21.15 19.45 18.35 20.5 14.5Z"
        fill="white"
      />
    </svg>
  </IconBox>
);

/* Premium System Icon */
export const PremiumSystemIcon = () => (
  <IconBox gradient="from-zinc-700 via-zinc-800 to-black shadow-black/30">
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="13"
        rx="2"
        stroke="white"
        strokeWidth="1.8"
      />
      <path
        d="M8 21H16"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 17V21"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  </IconBox>
);

const themes = [
  {
    name: "Light",
    icon: PremiumLightIcon,
    mode: "light" as ThemeMode,
  },
  {
    name: "Dark",
    icon: PremiumDarkIcon,
    mode: "dark" as ThemeMode,
  },
  {
    name: "System Default",
    icon: PremiumSystemIcon,
    mode: "system" as ThemeMode,
  },
];

export default function ThemePage() {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] =
  useState<ThemeMode>("light");

useEffect(() => {
  setSelectedTheme(getSavedTheme());
}, []);

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-slate-900 dark:bg-[#0b0b0d] dark:text-white">
      <div className="mx-auto w-full max-w-md px-5 pb-10">

        {/* Header */}
        <header className="flex items-center gap-4 py-6">
          <button
  type="button"
  onClick={() => router.back()}
  aria-label="Go back"
  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 transition active:scale-90 dark:bg-[#18181b] dark:text-white dark:ring-white/10"
>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <h1 className="text-xl font-semibold">
            Theme
          </h1>
        </header>

        {/* Theme Options */}
        <section className="mt-7 space-y-4">
          {themes.map((theme) => {
            const ThemeIcon = theme.icon;

            return (
             <button
      key={theme.name}
      type="button"
      onClick={() => {
        setSelectedTheme(theme.mode);
        saveTheme(theme.mode);
      }}
      className="group flex w-full items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-sm transition-all active:scale-[0.985] dark:border-white/10 dark:bg-[#18181b]"
    >
                <ThemeIcon />

                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold">
                    {theme.name}
                  </p>

                </div>

               <span
  className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
    selectedTheme === theme.mode
      ? "border-blue-600 dark:border-blue-400"
      : "border-slate-300 dark:border-white/20"
  }`}
>
  {selectedTheme === theme.mode && (
    <span className="h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
  )}
</span>
              </button>
            );
          })}
        </section>

      </div>
    </main>
  );
}