"use client";

import { useState } from "react";

const assets = [
  {
    name: "USDT",
    balance: "74.73",
    icon: "₮",
  },
  {
    name: "USDC",
    balance: "0.00",
    icon: "$",
  },
];

export default function Home() {
  const [active, setActive] = useState("Home");

  return (
    <main className="min-h-screen bg-[#f6f7f9] pb-28 text-slate-900 dark:bg-[#0b0b0d] dark:text-white">
      {/* ================= HEADER ================= */}
      <header className="px-5 pt-6">
        <div className="flex items-center justify-between">
          {/* Profile */}
          <button
            type="button"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white dark:bg-white dark:text-black">
              S
            </div>

            <span className="text-lg font-bold">
              Sumedh10
            </span>
          </button>

          {/* Notification */}
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-sm dark:bg-[#18181b]"
          >
            ♧
          </button>
        </div>
      </header>

      {/* ================= BALANCE ================= */}
      <section className="px-5 pt-6">
        <div className="overflow-hidden rounded-[30px] bg-[#0b0b0d] px-6 py-7 shadow-xl dark:bg-white">
          <p className="text-sm font-medium text-white/60 dark:text-black/50">
            Total Balance
          </p>

          <div className="mt-3 flex items-end gap-2">
            <span className="text-5xl font-bold tracking-tight text-white dark:text-black">
              0.00
            </span>

            <span className="mb-1 text-xl font-semibold text-white/70 dark:text-black/60">
              USDC
            </span>
          </div>

          <p className="mt-3 text-xs text-white/40 dark:text-black/40">
            Available balance
          </p>
        </div>
      </section>

      {/* ================= ACTIONS ================= */}
      <section className="grid grid-cols-3 gap-4 px-5 pt-6">
        <ActionButton
          icon="↑"
          label="Send"
        />

        <ActionButton
          icon="↓"
          label="Receive"
        />

        <ActionButton
          icon="⌗"
          label="QR"
        />
      </section>

      {/* ================= ASSETS ================= */}
      <section className="px-5 pt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Assets
          </h2>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-2xl shadow-sm dark:bg-[#18181b]"
          >
            +
          </button>
        </div>

        <div className="overflow-hidden rounded-[24px] bg-white shadow-sm dark:bg-[#18181b]">
          {assets.map((asset, index) => (
            <div key={asset.name}>
              {index !== 0 && (
                <div className="mx-5 border-t border-slate-100 dark:border-white/10" />
              )}

              <button
                type="button"
                className="flex w-full items-center justify-between px-5 py-5 text-left transition active:bg-slate-50 dark:active:bg-white/5"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold ${
                      asset.name === "USDT"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {asset.icon}
                  </div>

                  <div>
                    <p className="font-semibold">
                      {asset.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {asset.balance} {asset.name}
                    </p>
                  </div>
                </div>

                <p className="font-bold">
                  {asset.balance}
                </p>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ================= VALIDATOR ================= */}
      <section className="px-5 pt-8">
        <div className="border-t border-slate-200 pt-7 dark:border-white/10">
          <h2 className="text-2xl font-bold">
            Validator Panel
          </h2>

          <input
            type="text"
            placeholder="Target STBX UID (STBXX..)"
            className="mt-5 w-full rounded-[22px] border border-slate-200 bg-white px-5 py-5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-900 dark:border-white/10 dark:bg-[#18181b] dark:focus:border-white"
          />
        </div>
      </section>

      {/* ================= BOTTOM NAV ================= */}
      <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-slate-200 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-[#111113]/95">
        <div className="grid grid-cols-5 items-end">
          <NavItem
            label="Home"
            icon="⌂"
            active={active === "Home"}
            onClick={() => setActive("Home")}
          />

          <NavItem
            label="D/W"
            icon="⇅"
            active={active === "D/W"}
            onClick={() => setActive("D/W")}
          />

          {/* BUSINESS CENTER */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => setActive("Business")}
              className={`-mt-8 flex h-16 w-16 items-center justify-center rounded-full text-2xl shadow-xl ring-4 ring-[#f6f7f9] transition active:scale-95 dark:ring-[#0b0b0d] ${
                active === "Business"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-900 text-white dark:bg-white dark:text-black"
              }`}
            >
              ◈
            </button>

            <span
              className={`mt-1 text-[11px] font-semibold ${
                active === "Business"
                  ? "text-blue-600"
                  : "text-slate-500"
              }`}
            >
              Business
            </span>
          </div>

          <NavItem
            label="History"
            icon="◷"
            active={active === "History"}
            onClick={() => setActive("History")}
          />

          <NavItem
            label="More"
            icon="☰"
            active={active === "More"}
            onClick={() => setActive("More")}
          />
        </div>
      </nav>
    </main>
  );
}

/* ================= ACTION BUTTON ================= */

function ActionButton({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex flex-col items-center gap-3 rounded-[24px] bg-white py-4 shadow-sm transition active:scale-95 dark:bg-[#18181b]"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-3xl font-light text-white shadow-lg shadow-blue-200 dark:shadow-blue-950">
        {icon}
      </span>

      <span className="text-sm font-semibold">
        {label}
      </span>
    </button>
  );
}

/* ================= NAV ITEM ================= */

function NavItem({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 py-1 text-[11px] font-semibold transition ${
        active
          ? "text-blue-600"
          : "text-slate-500 dark:text-slate-400"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl text-xl ${
          active
            ? "bg-blue-50 dark:bg-blue-950/40"
            : ""
        }`}
      >
        {icon}
      </span>

      {label}
    </button>
  );
}