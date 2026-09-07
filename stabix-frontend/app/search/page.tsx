"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type User = {
  stbx_uid?: string;
  username?: string;
  profile_image?: string | null;
  profileImage?: string | null;
};

export default function SearchPage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const uid = query.trim();

    if (!uid) {
      setUser(null);
      setSearched(false);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setUser(null);
      setSearched(false);

      try {
        const data = await apiFetch(
          `/api/users/${encodeURIComponent(uid)}`
        );

        if (data?.user) {
          setUser(data.user);
        } else if (data) {
          setUser(data);
        }

        setSearched(true);
      } catch (error) {
        console.error("User search error:", error);
        setUser(null);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const profileImage =
    user?.profile_image ||
    user?.profileImage ||
    null;

  const profileImageUrl = profileImage
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace(
        /\/$/,
        ""
      )}${profileImage}`
    : null;

  const firstLetter =
    user?.username?.trim().charAt(0).toUpperCase() ||
    "S";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-md px-4">

        {/* Header */}
        <div className="flex items-center gap-3 pt-5">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl text-foreground"
          >
            ←
          </button>

          <h1 className="text-xl font-bold">
            Search
          </h1>
        </div>

        {/* Search Box */}
        <div className="mt-5 flex items-center rounded-full bg-input border border-border">

          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-3 shrink-0 text-slate-500 dark:text-slate-300"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
            />
            <path d="m20 20-4-4" />
          </svg>

          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder="Search by StabiX UID"
            autoFocus
            autoComplete="off"
           className="min-w-0 flex-1 bg-transparent text-[16px] text-slate-900 outline-none placeholder:text-slate-500 dark:text-white dark:placeholder:text-slate-400"
          />

          {loading && (
            <div className="ml-2 h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-border border-t-blue-600" />
          )}
        </div>

        {/* User Result */}
        {user && (
         <button
  type="button"
  onClick={() => {
    if (user?.stbx_uid) {
      router.push(
        `/user/${encodeURIComponent(user.stbx_uid)}`
      );
    }
  }}
  className="mt-5 flex w-full items-center rounded-2xl border border-border bg-surface p-4 text-left shadow-sm transition active:scale-[0.99]"
>
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Profile"
                className="h-14 w-14 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                {firstLetter}
              </div>
            )}

            <div className="ml-4 min-w-0">
              <div className="truncate text-[17px] font-bold text-slate-900 dark:text-white">
                {user.username || "Unknown User"}
              </div>

              <div className="mt-1 truncate text-[13px] text-slate-500 dark:text-slate-400">
                {user.stbx_uid || query.trim()}
              </div>
            </div>

            <div className="ml-auto text-xl text-slate-500 dark:text-slate-300">
              ›
            </div>
          </button>
        )}

        {/* Not Found */}
        {searched && !user && !loading && (
          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            User not found
          </div>
        )}

      </div>
    </main>
  );
}