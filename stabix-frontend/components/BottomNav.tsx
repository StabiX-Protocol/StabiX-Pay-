"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(path);
  };

  return (
    <>
      {/* More Menu */}
      {moreOpen && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
            className="fixed inset-0 z-[55] bg-black/10 backdrop-blur-[2px]"
          />

          <div className="fixed bottom-[94px] left-1/2 z-[60] w-[calc(100%-40px)] max-w-md -translate-x-1/2 overflow-hidden rounded-[24px] border border-slate-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-[#18181b]">

            <MoreLink
              icon="▣"
              label="Security"
              href="/security"
              onClick={() => setMoreOpen(false)}
            />

            <MoreLink
              icon="◆"
              label="Business Account"
              href="/business"
              onClick={() => setMoreOpen(false)}
            />
          </div>
        </>
      )}

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-24px)] max-w-md -translate-x-1/2 rounded-[28px] border border-slate-200 bg-white/95 px-2 py-2 shadow-[0_12px_40px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-[#151518]/95 dark:shadow-black/40">
        <div className="grid grid-cols-5 items-center">

          {/* Home */}
          <NavLink
            href="/"
            label="Home"
            icon="⌂"
            active={isActive("/")}
          />

          {/* D/W */}
          <NavLink
            href="/dw"
            label="D/W"
            icon="⇅"
            active={isActive("/dw")}
          />

          {/* Center Profile */}
          <div className="flex justify-center">
            <Link
              href="/profile"
              aria-label="Profile"
              className={`-mt-7 flex h-[58px] w-[58px] items-center justify-center rounded-full border-4 border-[#f6f7f9] bg-blue-600 text-white shadow-xl shadow-blue-200 transition active:scale-95 dark:border-[#0b0b0d] dark:shadow-blue-950 ${
                isActive("/profile")
                  ? "bg-blue-700"
                  : "bg-blue-600"
              }`}
            >
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20c.8-3.5 3.2-5.5 7-5.5s6.2 2 7 5.5" />
              </svg>
            </Link>
          </div>

          {/* History */}
          <NavLink
            href="/history"
            label="History"
            icon="◷"
            active={isActive("/history")}
          />

          {/* More */}
          <button
            type="button"
            onClick={() => setMoreOpen((value) => !value)}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl py-2 transition active:scale-95 ${
              moreOpen
                ? "text-blue-600"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-xl text-xl ${
                moreOpen
                  ? "bg-blue-50 dark:bg-blue-950/40"
                  : ""
              }`}
            >
              ☰
            </span>

            <span className="text-[11px] font-semibold">
              More
            </span>
          </button>

        </div>
      </nav>
    </>
  );
}

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl py-2 transition active:scale-95 ${
        active
          ? "text-blue-600"
          : "text-slate-500 dark:text-slate-400"
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-xl text-xl ${
          active
            ? "bg-blue-50 dark:bg-blue-950/40"
            : ""
        }`}
      >
        {icon}
      </span>

      <span className="text-[11px] font-semibold">
        {label}
      </span>
    </Link>
  );
}

function MoreLink({
  icon,
  label,
  href,
  onClick,
}: {
  icon: string;
  label: string;
  href: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition active:bg-slate-100 dark:active:bg-white/5"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg dark:bg-[#242428]">
        {icon}
      </span>

      <span className="text-sm font-semibold">
        {label}
      </span>
    </Link>
  );
}