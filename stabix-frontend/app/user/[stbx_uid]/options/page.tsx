"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type User = {
  stbx_uid?: string;
  username?: string;
  profile_image?: string | null;
};

export default function UserOptionsPage() {
  const params = useParams();
  const router = useRouter();

  const stbx_uid = String(params.stbx_uid);

  const [user, setUser] = useState<User | null>(null);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await apiFetch(
          `/api/users/profile/${encodeURIComponent(stbx_uid)}`
        );

        if (data?.success && data.user) {
          setUser(data.user);
        }

        const blockData = await apiFetch(
          `/api/blocks/${encodeURIComponent(stbx_uid)}`
        );

        if (blockData?.success) {
          setBlocked(blockData.blocked);
        }
      } catch (error) {
        console.error(
          "Load user options error:",
          error
        );
      }
    };

    loadUser();
  }, [stbx_uid]);

  useEffect(() => {
    const saved = localStorage.getItem(
      `chat-enabled-${stbx_uid}`
    );

    if (saved !== null) {
      setChatEnabled(saved === "true");
    }
  }, [stbx_uid]);

  return (
    <div className="min-h-screen bg-[#f5f7fb] dark:bg-[#0a0a0f]">
      <div className="mx-auto min-h-screen w-full max-w-[430px]">

        <header className="flex items-center px-5 py-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="text-3xl leading-none text-slate-900 dark:text-white"
          >
            ‹
          </button>
        </header>

        <div className="px-5 pt-8">

          <div className="flex flex-col items-center">

            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-4xl font-semibold text-white">
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.username?.charAt(0).toUpperCase() || "?"
              )}
            </div>

            <h1 className="mt-5 text-3xl font-medium text-slate-900 dark:text-white">
              {user?.username || "User"}
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              STBX UID: {user?.stbx_uid || stbx_uid}
            </p>

          </div>

          <div className="mt-10 space-y-7">

            {/* CHAT */}

            <div className="flex items-center justify-between">

              <p className="text-lg font-medium text-slate-900 dark:text-white">
                Chat
              </p>

              <button
                type="button"
                onClick={() => {
                  setChatEnabled((value) => {
                    const next = !value;

                    localStorage.setItem(
                      `chat-enabled-${stbx_uid}`,
                      String(next)
                    );

                    return next;
                  });
                }}
                aria-label="Toggle chat"
                className={`relative h-10 w-20 rounded-full transition ${
                  chatEnabled
                    ? "bg-blue-600"
                    : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-1 h-8 w-8 rounded-full bg-white shadow transition ${
                    chatEnabled
                      ? "right-1"
                      : "left-1"
                  }`}
                />
              </button>

            </div>

            {/* BLOCK */}

            <div className="flex items-center justify-between">

              <p className="text-lg font-medium text-slate-900 dark:text-white">
                Block
              </p>

              <button
                type="button"
                onClick={async () => {
                  try {
                    if (blocked) {
                      await apiFetch("/api/blocks", {
                        method: "DELETE",
                        body: JSON.stringify({
                          blocked_stbx_uid: stbx_uid,
                        }),
                      });

                      setBlocked(false);
                    } else {
                      await apiFetch("/api/blocks", {
                        method: "POST",
                        body: JSON.stringify({
                          blocked_stbx_uid: stbx_uid,
                        }),
                      });

                      setBlocked(true);
                    }
                  } catch (error) {
                    console.error(
                      "Block toggle error:",
                      error
                    );
                  }
                }}
                aria-label="Toggle block"
                className={`relative h-10 w-20 rounded-full transition ${
                  blocked
                    ? "bg-blue-600"
                    : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-1 h-8 w-8 rounded-full bg-white shadow transition ${
                    blocked
                      ? "right-1"
                      : "left-1"
                  }`}
                />
              </button>

            </div>

            {/* REPORT */}

            <button
              type="button"
              className="flex w-full items-center py-1 text-left"
            >
              <span className="text-lg font-medium text-slate-900 dark:text-white">
                Report
              </span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}