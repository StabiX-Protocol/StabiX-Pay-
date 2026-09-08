"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Balance = {
  asset: string;
  balance: string | number;
};

type Transaction = {
  STRId: string;
  type: "sent" | "received" | "deposit" | "withdraw";
  status?: string;
  asset: string;
  amount: string | number;
  counterparty?: string | null;
  created_at: string;
};

const assets = [
  {
    name: "USDT",
    icon: "/media/tether-usdt-logo.png",
  },
  {
    name: "USDC",
    icon: "/media/usd-coin-usdc-logo.png",
  },
];

export default function DWPage() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] =
    useState(true);

  const loadBalances = async () => {
    try {
      const data = await apiFetch("/api/balance");

      console.log("D/W BALANCE API:", data);

      if (
        data?.success &&
        Array.isArray(data.balances)
      ) {
        setBalances(data.balances);
      }
    } catch (error) {
      console.error(
        "D/W balance API error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);

      const data = await apiFetch(
        "/api/transactions/history"
      );

      console.log("D/W HISTORY API:", data);

      const history: Transaction[] =
        Array.isArray(data)
          ? data
          : data?.transactions || [];

      const recentDW = history
        .filter(
          (transaction) =>
            transaction.type === "deposit" ||
            transaction.type === "withdraw"
        )
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )
        .slice(0, 5);

      setTransactions(recentDW);
    } catch (error) {
      console.error(
        "D/W transaction history API error:",
        error
      );

      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    loadBalances();
    loadTransactions();

    /*
     * Refresh balance after another page
     * announces a balance change.
     */
    const handleBalanceUpdate = () => {
      loadBalances();
    };

    /*
     * Refresh balance when user returns
     * to this page.
     */
    const handleFocus = () => {
      loadBalances();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadBalances();
        loadTransactions();
      }
    };

    window.addEventListener(
      "stabix-balance-update",
      handleBalanceUpdate
    );

    window.addEventListener(
      "focus",
      handleFocus
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener(
        "stabix-balance-update",
        handleBalanceUpdate
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  const getBalance = (assetName: string) => {
    const item = balances.find(
      (balance) =>
        balance.asset.toUpperCase() ===
        assetName.toUpperCase()
    );

    return Number(item?.balance ?? 0).toFixed(2);
  };

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-5 pb-32 text-slate-900 dark:bg-[#0b0b0d] dark:text-white">
      <div className="mx-auto w-full max-w-md">

        {/* Header */}
        <header className="flex items-center gap-3 py-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Deposit & Withdraw
            </h1>
          </div>
        </header>

        {/* Select Asset */}
        <section>
          <h2 className="text-[30px] font-bold tracking-tight">
            Select Asset
          </h2>

          <div className="mt-6 space-y-3">
            {assets.map((asset) => {
              return (
                <Link
                  key={asset.name}
                  href={`/dw/${asset.name.toLowerCase()}`}
                  className="flex w-full items-center justify-between rounded-[22px] bg-white px-6 py-5 text-left shadow-sm ring-1 ring-slate-200 transition-all active:scale-[0.985] dark:bg-[#18181b] dark:ring-white/10"
                >
                  <div className="flex items-center gap-4">

                    {/* Asset Logo */}
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full">
                      <img
                        src={asset.icon}
                        alt={asset.name}
                        className="h-14 w-14 rounded-full object-contain"
                      />
                    </div>

                    <span className="text-xl font-medium">
                      {asset.name}
                    </span>
                  </div>

                  {/* LIVE API BALANCE */}
                  <span className="text-xl font-bold">
                    {loading
                      ? "..."
                      : getBalance(asset.name)}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="pt-10">
          <h2 className="text-xl font-bold tracking-tight">
            Recent Activity
          </h2>

          <div className="mt-5">

            {loadingTransactions ? (
              <p className="py-4 text-sm text-muted">
                Loading...
              </p>
            ) : transactions.length === 0 ? (
              <p className="py-4 text-sm text-muted">
                No recent D/W
              </p>
            ) : (
              transactions.map((transaction) => {
                const isDeposit =
                  transaction.type === "deposit";

                const dateString =
                  new Date(
                    transaction.created_at
                  ).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                return (
                  <div
                    key={transaction.STRId}
                    className="flex items-center justify-between border-b border-slate-200 py-3 dark:border-white/10"
                  >
                    <div className="min-w-0">
                      <p className="text-lg font-medium">
                        {isDeposit
                          ? "Deposit"
                          : "Withdraw"}
                      </p>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {dateString}
                      </p>
                    </div>

                    <p
                      className={`ml-3 shrink-0 text-lg font-semibold ${
                        isDeposit
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isDeposit ? "+" : "-"}{" "}
                      {Number(
                        transaction.amount
                      ).toFixed(2)}{" "}
                      {transaction.asset}
                    </p>
                  </div>
                );
              })
            )}

          </div>
        </section>

      </div>
    </main>
  );
}