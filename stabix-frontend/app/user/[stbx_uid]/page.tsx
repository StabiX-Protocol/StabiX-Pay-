"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type User = {
  stbx_uid?: string;
  username?: string;
  profile_image?: string | null;
  profileImage?: string | null;
};

type Transaction = {
  STRId: string;
  type: "sent" | "received" | "deposit" | "withdraw";
  status?: string;
  asset: string;
  amount: string | number;
  counterparty?: string | null;
  created_at: string;
  stbx_uid?: string;
};

export default function UserPage() {
  const router = useRouter();
  const params = useParams();

  const stbx_uid = params.stbx_uid as string;

  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserAndTransactions() {
      try {
        // User
        const userData = await apiFetch(
          `/api/users/${encodeURIComponent(stbx_uid)}`
        );

        const foundUser = userData?.user || userData;

        setUser(foundUser);

        // Current user's history
        const historyData = await apiFetch(
          `/api/transactions/history`
        );

        const history: Transaction[] =
          historyData?.transactions || [];

        // Only transactions involving this user
        const filtered = history.filter((transaction) => {
          return (
            transaction.counterparty === stbx_uid ||
            transaction.stbx_uid === stbx_uid
          );
        });

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

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-md px-4 py-8 text-center text-sm text-muted">
          Loading...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-md px-4 py-8 text-center">
          <div className="text-sm text-muted">
            User not found
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-md px-4 pb-10">

        {/* Header */}
        <div className="flex items-center pt-5">
         <button
  type="button"
  onClick={() => router.replace("/")}
  aria-label="Go back"
  className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-slate-800 dark:text-white"
>
  ←
</button>

          <h1 className="ml-2 text-xl font-bold">
            User
          </h1>
        </div>

        {/* User Profile */}
        <div className="flex flex-col items-center pt-8">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt="Profile"
              className="h-24 w-24 rounded-full object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white">
              {firstLetter}
            </div>
          )}

          <div className="mt-4 text-xl font-bold">
            {user.username || "Unknown User"}
          </div>

          <div className="mt-1 text-sm text-muted">
            {user.stbx_uid || stbx_uid}
          </div>
        </div>

        {/* Transactions */}
        <div className="mt-10">
          <h2 className="text-lg font-bold">
            Transactions
          </h2>

          {transactions.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-surface p-5 text-center text-sm text-muted ring-1 ring-[var(--border)]">
              No transactions with this user
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl bg-surface ring-1 ring-[var(--border)]">
              {transactions.map((transaction) => {
                const isReceived =
                  transaction.type === "received";

                const isSent =
                  transaction.type === "sent";

                return (
                  <button
                    key={transaction.STRId}
                    type="button"
                    onClick={() =>
                     router.push(
  `/history/${encodeURIComponent(
    transaction.STRId
  )}?from=user&user=${encodeURIComponent(stbx_uid)}`
)
                    }
                    className="flex w-full items-center border-b border-[var(--border)] px-4 py-4 text-left last:border-b-0 active:bg-slate-50 dark:active:bg-slate-800"
                  >
                    {/* Icon */}
                   <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
  <img
    src={
      transaction.asset.toUpperCase() === "USDC"
        ? "/media/usd-coin-usdc-logo.png"
        : "/media/tether-usdt-logo.png"
    }
    alt={transaction.asset}
    className="h-8 w-8 rounded-full object-contain"
  />
</div>

                    {/* Details */}
                    <div className="ml-3 min-w-0 flex-1">
                      <div className="font-semibold">
                        {isReceived
                          ? "Received"
                          : isSent
                          ? "Sent"
                          : transaction.type}
                      </div>

                      <div className="mt-1 text-xs text-muted">
  {new Date(
    transaction.created_at
  ).toLocaleDateString()}
  {" • "}
  {new Date(
    transaction.created_at
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}
</div>
                    </div>

                    {/* Amount */}
                    <div
                      className={`ml-3 text-right font-semibold ${
  isReceived
    ? "text-green-600"
    : "text-red-600"
}`}
                    >
                      {isReceived ? "+" : "-"}
                      {transaction.amount}{" "}
                      {transaction.asset}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}