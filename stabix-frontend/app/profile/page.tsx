"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Profile = {
  stbx_uid?: string;
  username?: string;
  email?: string | null;
  eoa_address?: string | null;
  profile_image?: string | null;
  profileImage?: string | null;
};

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const stbxUid = localStorage.getItem("stbx_uid");

      if (!stbxUid) {
        console.error("StabiX UID not found");
        return;
      }

      const data = await apiFetch(
        `/api/users/profile/${stbxUid}`
      );

      console.log("PROFILE API:", data);

      if (data?.user) {
        setProfile(data.user);
      }
    } catch (error) {
      console.error("Profile API error:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyStabiXUid = async () => {
    if (!profile?.stbx_uid) return;

    try {
      await navigator.clipboard.writeText(profile.stbx_uid);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const firstLetter =
    profile?.username
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "?";

  const profileImage =
    profile?.profile_image ||
    profile?.profileImage ||
    null;

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-5 pb-32 text-slate-900 dark:bg-[#0b0b0d] dark:text-white">

      <div className="mx-auto w-full max-w-md">

        {/* HEADER */}

        <header className="flex items-center justify-between py-7">

          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-11 w-11 items-center justify-center rounded-full text-3xl transition active:scale-90"
          >
            ←
          </button>

          <h1 className="flex-1 text-center text-[28px] font-bold tracking-tight">
            Profile
          </h1>

          <div className="w-11" />

        </header>

        {loading ? (

          /* LOADING */

          <div className="mt-16 text-center text-slate-400">
            Loading profile...
          </div>

        ) : (

          <>

            {/* PROFILE HEADER */}

            <section className="mt-8 flex flex-col items-center">

              {/* PROFILE IMAGE */}

              {profileImage ? (

                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-28 w-28 rounded-full object-cover shadow-lg ring-4 ring-white dark:ring-[#18181b]"
                />

              ) : (

                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-600 text-[48px] font-bold text-white shadow-lg">
                  {firstLetter}
                </div>

              )}

              {/* USERNAME */}

              <h2 className="mt-5 text-[26px] font-bold">
                {profile?.username || "Username"}
              </h2>

            </section>


            {/* PROFILE DETAILS */}

            <section className="mt-10 overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-100 dark:bg-[#18181b] dark:ring-white/10">

              {/* STABIX UID */}

              <div className="px-5 py-5">

                <p className="text-xs font-medium text-slate-400">
                  StabiX UID
                </p>

                <div className="mt-2 flex items-center justify-between gap-3">

                  <p className="min-w-0 flex-1 break-all text-[17px] font-bold">
                    {profile?.stbx_uid || "Not available"}
                  </p>

                  {/* COPY BUTTON */}

                  <button
                    type="button"
                    onClick={copyStabiXUid}
                    disabled={!profile?.stbx_uid}
                    aria-label="Copy StabiX UID"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all duration-150 active:scale-90 hover:bg-slate-200 disabled:opacity-40 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <rect
                        width="13"
                        height="13"
                        x="9"
                        y="9"
                        rx="2"
                      />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>

                </div>

              </div>


              <div className="mx-5 border-t border-slate-100 dark:border-white/10" />


              {/* USERNAME */}

              <div className="px-5 py-5">

                <p className="text-xs font-medium text-slate-400">
                  Username
                </p>

                <p className="mt-2 text-[17px] font-bold">
                  {profile?.username || "Not available"}
                </p>

              </div>


              <div className="mx-5 border-t border-slate-100 dark:border-white/10" />


              {/* EMAIL */}

              <div className="px-5 py-5">

                <p className="text-xs font-medium text-slate-400">
                  Email
                </p>

                <p className="mt-2 break-all text-[17px] font-bold">
                  {profile?.email || "Not available"}
                </p>

              </div>


              <div className="mx-5 border-t border-slate-100 dark:border-white/10" />


              {/* EOA ADDRESS */}

              <div className="px-5 py-5">

                <p className="text-xs font-medium text-slate-400">
                  EOA Address
                </p>

                <p className="mt-2 break-all text-[15px] font-bold leading-6">
                  {profile?.eoa_address || "Not available"}
                </p>

              </div>

            </section>

          </>

        )}

      </div>


      {/* COPY SUCCESS POPUP */}

      {copied && (
        <div className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 animate-[fadeIn_0.15s_ease-out]">

          <div className="flex items-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-xl">

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>

            StabiX UID copied

          </div>

        </div>
      )}

    </main>
  );
}