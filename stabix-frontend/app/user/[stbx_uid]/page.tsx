"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { apiFetch } from "@/lib/api";

type User = {
  stbx_uid?: string;
  username?: string;
  profile_image?: string | null;
  profileImage?: string | null;
};

type Transaction = {
  STRId: string;
  type:
    | "sent"
    | "received"
    | "deposit"
    | "withdraw";
  status?: string;
  asset: string;
  amount: string | number;
  counterparty?: string | null;
  created_at: string;
  stbx_uid?: string;
  eoa_address?: string | null;
};

export default function UserPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const stbx_uid = params.stbx_uid as string;

  const [user, setUser] =
    useState<User | null>(null);

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [loading, setLoading] =
    useState(true);

  /*
   * LOAD USER + TRANSACTIONS
   */

  useEffect(() => {
    async function loadUserAndTransactions() {
      try {
        const userData = await apiFetch(
          `/api/users/${encodeURIComponent(
            stbx_uid
          )}`
        );

        const foundUser =
          userData?.user || userData;

        setUser(foundUser);

        const historyData = await apiFetch(
          "/api/transactions/history"
        );

        const history: Transaction[] =
          historyData?.transactions || [];

        /*
         * Keep existing filtering logic.
         */

        const filtered = history
          .filter((transaction) => {
            return (
              transaction.counterparty ===
                stbx_uid ||
              transaction.stbx_uid === stbx_uid
            );
          })
          /*
           * Conversation order:
           * OLD → NEW
           */
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );

        setTransactions(filtered);
      } catch (error) {
        console.error(
          "User/transaction load error:",
          error
        );

        setUser(null);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }

    if (stbx_uid) {
      loadUserAndTransactions();
    }
  }, [stbx_uid]);

  /*
   * PROFILE IMAGE
   */

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
    user?.username
      ?.trim()
      .charAt(0)
      .toUpperCase() || "S";

  /*
   * BACK ROUTING
   *
   * People → User → Home
   * Search → User → Search
   */

  const handleBack = () => {
    if (searchParams.get("from") === "home") {
      router.replace("/");
      return;
    }

    router.back();
  };

  /*
   * ASSET LOGO
   */

  const getAssetLogo = (asset: string) => {
    if (
      asset.toUpperCase() === "USDT"
    ) {
      return "/media/tether-usdt-logo.png";
    }

    return "/media/usd-coin-usdc-logo.png";
  };

  /*
   * FORMAT DATE
   */

  const formatDateLabel = (date: string) => {
    return new Date(
      date
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  /*
   * FORMAT TIME
   */

  const formatTime = (date: string) => {
    return new Date(
      date
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /*
   * LOADING
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-md px-4 py-8 text-center text-sm text-muted">
          Loading...
        </div>
      </main>
    );
  }

  /*
   * USER NOT FOUND
   */

  if (!user) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-md px-4 py-8 text-center">
          <div className="text-sm text-muted">
            User not found
          </div>

          <button
            type="button"
            onClick={() => router.replace("/")}
            aria-label="Go back"
            className="mt-4 flex h-10 w-10 items-center justify-center rounded-full text-2xl text-slate-800 dark:text-white"
          >
            ←
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="h-[100dvh] overflow-hidden bg-[#f6f7f9] text-slate-900 dark:bg-[#0b0b0d] dark:text-white">

      <div className="mx-auto flex h-full w-full max-w-md flex-col">

        {/* =========================
            FIXED USER HEADER
        ========================= */}

        <header className="z-40 flex shrink-0 items-center border-b border-slate-200 bg-[#f6f7f9] px-4 py-4 dark:border-white/10 dark:bg-[#0b0b0d]">

          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-3xl transition active:scale-90"
          >
            ←
          </button>

          {/* Profile */}

          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt="Profile"
              className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/10"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white ring-1 ring-slate-200 dark:ring-white/10">
              {firstLetter}
            </div>
          )}

          {/* User information */}

          <div className="ml-3 min-w-0">
            <div className="truncate text-[20px] font-bold">
              {user.username ||
                "Unknown User"}
            </div>

            <div className="mt-0.5 truncate text-sm text-muted">
              {user.stbx_uid || stbx_uid}
            </div>
          </div>

        </header>

        {/* =========================
            TRANSACTION CONVERSATION
            ONLY THIS AREA SCROLLS
        ========================= */}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-5">

          {transactions.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-sm text-muted">
              No transactions with this user
            </div>
          ) : (
            <div className="flex min-h-full flex-col justify-end space-y-4">
              {transactions.map(
                (transaction, index) => {

                  const isReceived =
                    transaction.type ===
                    "received";

                  const isSent =
                    transaction.type ===
                    "sent";

                  /*
                   * Ignore anything that isn't
                   * a person-to-person payment.
                   */

                  if (
                    !isReceived &&
                    !isSent
                  ) {
                    return null;
                  }

                  const asset =
                    transaction.asset.toUpperCase();

                  /*
                   * IMPORTANT:
                   * Do NOT use Number() or toFixed().
                   * Show amount exactly as received.
                   */

                  const amount =
                    String(transaction.amount);

                  /*
                   * Show date separator only when
                   * this transaction is the first
                   * transaction of a new date.
                   */

                  const currentDate =
                    new Date(
                      transaction.created_at
                    ).toDateString();

                  const previousTransaction =
                    transactions[index - 1];

                  const previousDate =
                    previousTransaction
                      ? new Date(
                          previousTransaction.created_at
                        ).toDateString()
                      : null;

                  const showDate =
                    index === 0 ||
                    currentDate !== previousDate;

                  /*
                   * GPay style title
                   */

                  const title = isReceived
                    ? "Payment to you"
                    : `Payment to ${
                        user.username ||
                        "User"
                      }`;

                  return (
                    <div
                      key={transaction.STRId}
                      className="w-full"
                    >

                      {/* =====================
                          DATE SEPARATOR
                      ===================== */}

                      {showDate && (
                        <div className="mb-3 mt-2 flex items-center gap-3">
                          <div className="h-px flex-1 bg-slate-300 dark:bg-white/10" />

                          <span className="shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
                            {formatDateLabel(
                              transaction.created_at
                            )}
                          </span>

                          <div className="h-px flex-1 bg-slate-300 dark:bg-white/10" />
                        </div>
                      )}

                      {/* =====================
                          PAYMENT CARD
                      ===================== */}

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/history/${encodeURIComponent(
                              transaction.STRId
                            )}?from=user&user=${encodeURIComponent(
                              stbx_uid
                            )}`
                          )
                        }
                        className={`flex w-full ${
                          isReceived
                            ? "justify-start"
                            : "justify-end"
                        }`}
                      >

                        <div
                          className={`w-[78%] rounded-[28px] px-5 py-4 text-left shadow-sm ${
                            isReceived
                              ? "bg-white dark:bg-[#303030]"
                              : "bg-blue-50 dark:bg-[#1d2942]"
                          }`}
                        >

                          {/* TITLE */}

                          <div className="text-[18px] font-semibold">
                            {title}
                          </div>

                          {/* EXACT AMOUNT */}

                         <div className="mt-3 flex items-center gap-2 text-[34px] font-medium tracking-tight">
  <span>{amount}</span>

  <span className="text-[22px] font-semibold">
    {asset}
  </span>

  <img
    src={getAssetLogo(asset)}
    alt={asset}
    className="h-6 w-6 rounded-full object-contain"
  />
</div>

                          {/* =================
                              PAID + ASSET + TIME
                          ================= */}

                          <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">

                            {/* PAID CHECK */}

                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-400 text-[14px] font-bold text-slate-900">
                              ✓
                            </span>

                            <span>
                              Paid
                            </span>

                            {/* ASSET LOGO */}

                            <img
                              src={getAssetLogo(
                                asset
                              )}
                              alt={asset}
                              className="h-[18px] w-[18px] shrink-0 rounded-full object-contain"
                            />

                            {/* ASSET */}

                            <span>
                              {asset}
                            </span>

                            {/* DOT */}

                            <span>
                              •
                            </span>

                            {/* TIME ONLY */}

                            <span>
                              {formatTime(
                                transaction.created_at
                              )}
                            </span>

                            {/* ARROW */}

                            <span className="ml-auto text-xl leading-none">
                              ›
                            </span>

                          </div>

                        </div>

                      </button>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

        {/* =========================
            FIXED BOTTOM PAYMENT BAR
        ========================= */}

        <div className="z-50 flex shrink-0 items-center gap-2 border-t border-slate-200 bg-[#f6f7f9] px-4 py-3 dark:border-white/10 dark:bg-[#0b0b0d]">

          {/* PAY */}

          <button
            type="button"
            onClick={() =>
              router.push(
                `/send/amount?asset=USDC&recipient=${encodeURIComponent(
                  stbx_uid
                )}`
              )
            }
            className="h-12 shrink-0 rounded-full bg-blue-600 px-7 text-[16px] font-bold text-white transition active:scale-95"
          >
            Pay
          </button>

          {/* MESSAGE */}

          <div className="flex h-12 min-w-0 flex-1 items-center rounded-full bg-slate-200 px-4 dark:bg-[#202124]">

            <input
              type="text"
              placeholder="Message..."
              className="min-w-0 flex-1 bg-transparent text-[16px] text-slate-900 outline-none placeholder:text-slate-500 dark:text-white dark:placeholder:text-slate-400"
            />

            {/* SEND */}

            <button
              type="button"
              aria-label="Send message"
              className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-700 dark:text-white"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>

          </div>

        </div>

      </div>

    </main>
  );
}