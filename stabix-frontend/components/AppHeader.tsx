"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Profile = {
  username?: string;
  profile_image?: string | null;
  profileImage?: string | null;
};

export default function AppHeader() {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [username, setUsername] = useState("Sumedh10");
  const [profileImage, setProfileImage] =
    useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const stbxUid =
        localStorage.getItem("stbx_uid");

      if (!stbxUid) return;

      const data = await apiFetch(
        `/api/users/profile/${stbxUid}`
      );

      if (data?.user) {
        const user: Profile = data.user;

        setUsername(
          user.username || "Sumedh10"
        );

        setProfileImage(
          user.profile_image ||
            user.profileImage ||
            null
        );
      }
    } catch (error) {
      console.error(
        "Header profile API error:",
        error
      );
    }
  };

  const firstLetter =
    username.trim().charAt(0).toUpperCase() || "S";

  const profileImageUrl = profileImage
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace(
        /\/$/,
        ""
      )}${profileImage}`
    : null;

  return (
    <>
      <header className="flex items-center gap-3 px-5 pb-3 pt-6">

        {/* Profile */}
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="shrink-0"
          aria-label="Open profile"
        >
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt="Profile"
              className="h-11 w-11 rounded-full object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {firstLetter}
            </div>
          )}
        </button>

        {/* Search */}
        <button
          type="button"
          onClick={() => router.push("/search")}
          aria-label="Search users"
          className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full bg-slate-100 px-4 text-left transition active:scale-[0.98] dark:bg-[#202124]"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-slate-500 dark:text-slate-400"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
            />
            <path d="m20 20-4-4" />
          </svg>

          <span className="truncate text-[14px] text-slate-500 dark:text-slate-400">
            Search friends & merchants
          </span>
        </button>

        {/* Right controls */}
        <div className="flex shrink-0 items-center gap-1">

          {/* Notification */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition active:scale-90 dark:text-white"
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
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>

            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-[#f6f7f9] dark:ring-[#0b0b0d]" />
          </button>

          {/* Settings */}
          <button
            type="button"
            aria-label="Settings"
            onClick={() => {
              setSettingsOpen(false);
              router.push("/settings");
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition active:scale-90 ${
              settingsOpen
                ? "bg-slate-900 text-white dark:bg-white dark:text-black"
                : "text-slate-700 dark:text-white"
            }`}
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
              <circle
                cx="12"
                cy="12"
                r="3"
              />

              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.8 1.8-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V22h-2.55v-.1a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.8-1.8.06-.06A1.7 1.7 0 0 0 7.6 15a1.7 1.7 0 0 0-1.56-1.03H5.9v-2.55h.14A1.7 1.7 0 0 0 7.6 10a1.7 1.7 0 0 0-.34-1.88L7.2 8.06l1.8-1.8.06.06A1.7 1.7 0 0 0 10.94 6a1.7 1.7 0 0 0 1.03-1.56V4h2.55v.44A1.7 1.7 0 0 0 15.55 6a1.7 1.7 0 0 0 1.88.34l.06-.06 1.8 1.8-.06.06A1.7 1.7 0 0 0 18.9 10a1.7 1.7 0 0 0 1.56 1.03h.14v2.55h-.14A1.7 1.7 0 0 0 19.4 15Z" />
            </svg>
          </button>

        </div>
      </header>
    </>
  );
}