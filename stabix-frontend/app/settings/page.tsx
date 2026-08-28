"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    router.replace("/login");
  };

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-slate-900 dark:bg-[#0b0b0d] dark:text-white">

      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 px-5 py-5 dark:border-white/10">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition active:scale-90 dark:text-white"
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
          Settings
        </h1>
      </div>

      {/* Settings Sections */}
      <div className="px-4 py-5">

        {/* Account */}
        <section className="mb-6">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Account
          </p>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#151518]">

            <button
              type="button"
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span>Profile</span>
              <span className="text-slate-400">›</span>
            </button>

            <div className="mx-5 border-t border-slate-100 dark:border-white/10" />

            <button
              type="button"
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span>Security</span>
              <span className="text-slate-400">›</span>
            </button>

          </div>
        </section>

        {/* Preferences */}
        <section className="mb-6">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Preferences
          </p>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#151518]">

            <button
              type="button"
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span>Notifications</span>
              <span className="text-slate-400">›</span>
            </button>

            <div className="mx-5 border-t border-slate-100 dark:border-white/10" />

            <button
              type="button"
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span>Appearance</span>
              <span className="text-slate-400">›</span>
            </button>

          </div>
        </section>

        {/* Session */}
        <section>
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Session
          </p>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#151518]">

            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="w-full px-5 py-4 text-left font-medium text-red-500 transition active:bg-red-500/10"
            >
              Log out
            </button>

          </div>
        </section>

      </div>

      {/* Logout Confirmation Modal */}
      {logoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#151518] p-6 shadow-2xl">

            <p className="text-sm font-medium text-slate-400">
              Session
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-white">
              Log out?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Are you sure you want to log out of your StabiX account?
            </p>

            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={() => setLogoutOpen(false)}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition active:scale-95"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 font-medium text-white transition active:scale-95"
              >
                Log out
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}