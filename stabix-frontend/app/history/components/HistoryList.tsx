"use client";

import Link from "next/link";
import type { HistoryFilters } from "../lib/historyFilters";

type TransactionType =
  | "sent"
  | "received"
  | "deposit"
  | "withdraw";

type Transaction = {
  STRId: string;
  type: TransactionType;
  status?: string;
  asset: string;
  amount: string | number;
  counterparty?: string | null;
  created_at: string;
};



type HistoryListProps = {
  transactions: Transaction[];
  filters: HistoryFilters;
  emptyText: string;
};

export default function HistoryList({
  transactions,
  filters,
  emptyText,
}: HistoryListProps) {
  const groups: Record<string, Transaction[]> = {};

  transactions.forEach((transaction) => {
    /*
     * Legacy logic:
     * Withdraw sirf APPROVED status mein show hota hai.
     */
    if (
      transaction.type === "withdraw" &&
      String(transaction.status || "").toUpperCase() !== "APPROVED"
    ) {
      return;
    }

    /*
     * Type filter
     */
    if (filters.type) {
      if (transaction.type !== filters.type) {
        return;
      }
    }

    /*
     * Asset filter
     */
    if (filters.asset) {
      if (transaction.asset !== filters.asset) {
        return;
      }
    }

    /*
     * Single date filter
     */
    if (filters.date) {
      const date = new Date(transaction.created_at)
        .toISOString()
        .slice(0, 10);

      if (date !== filters.date) {
        return;
      }
    }

    /*
     * Custom date range filter
     */
    if (filters.fromDate && filters.toDate) {
      const date = new Date(transaction.created_at)
        .toISOString()
        .slice(0, 10);

      if (
        date < filters.fromDate ||
        date > filters.toDate
      ) {
        return;
      }
    }

    /*
     * Amount filter
     */
    if (
      filters.minAmount != null ||
      filters.maxAmount != null
    ) {
      const amount = Number(transaction.amount);

      if (
        (filters.minAmount != null &&
          amount < filters.minAmount) ||
        (filters.maxAmount != null &&
          amount > filters.maxAmount)
      ) {
        return;
      }
    }

    /*
     * Legacy code:
     * created_at missing ho to transaction render nahi hota.
     */
    if (!transaction.created_at) {
      return;
    }

    /*
     * Month grouping
     */
    const date = new Date(transaction.created_at);

    const monthKey = date.toLocaleString("en-IN", {
      month: "long",
      year: "numeric",
    });

    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }

    groups[monthKey].push(transaction);
  });

  /*
   * Month groups ko newest month first sort karna.
   */
  const sortedGroups = Object.entries(groups).sort(
    ([, transactionsA], [, transactionsB]) => {
      const timeA = new Date(
        transactionsA[0].created_at
      ).getTime();

      const timeB = new Date(
        transactionsB[0].created_at
      ).getTime();

      return timeB - timeA;
    }
  );

  /*
   * Agar filtering ke baad koi transaction nahi hai.
   */
  if (sortedGroups.length === 0) {
    return (
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {emptyText}
      </span>
    );
  }

  return (
    <div>
      {sortedGroups.map(
        ([month, monthTransactions]) => {
          /*
           * Har month ke transactions newest first.
           */
          const sortedTransactions = [
            ...monthTransactions,
          ].sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );

          return (
            <section key={month} className="mt-4">
              <h2 className="mb-1 text-[18px] font-bold text-slate-700 dark:text-[#cbd5f5]">
                {month}
              </h2>

              <div>
                {sortedTransactions.map(
                  (transaction) => {
                    /*
                     * Credit:
                     * received + deposit
                     */
                    const isCredit =
                      transaction.type === "received" ||
                      transaction.type === "deposit";

                    /*
                     * Legacy:
                     * credit = success
                     * debit = danger
                     */
                    const amountClass = isCredit
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400";

                    /*
                     * Date/time formatting
                     */
                    const dateString =
                      new Date(
                        transaction.created_at
                      ).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                    /*
                     * Transaction label
                     */
                    let label = "Sent";

                    if (
                      transaction.type === "received"
                    ) {
                      label = "Received";
                    }

                    if (
                      transaction.type === "deposit"
                    ) {
                      label = "Deposit";
                    }

                    if (
                      transaction.type === "withdraw"
                    ) {
                      label = "Withdraw";
                    }

                    /*
                     * Counterparty / display name
                     */
                    let userId =
                      transaction.counterparty;

                    if (
                      transaction.type === "deposit"
                    ) {
                      userId = "Deposit";
                    }

                    if (
                      transaction.type === "withdraw"
                    ) {
                      userId = "Withdraw";
                    }

                    if (!userId) {
                      userId = "System";
                    }

                    /*
                     * Legacy:
                     * amount always 2 decimal places.
                     */
                    const displayAmount =
                      Number(
                        transaction.amount
                      ).toFixed(2);

                    return (
                      <Link
                        key={transaction.STRId}
                        href={`/history/${encodeURIComponent(
                          transaction.STRId
                        )}`}
                        className="flex items-center justify-between border-b border-slate-200 py-3 transition active:bg-slate-50 dark:border-white/10 dark:active:bg-white/5"
                      >
                        {/* LEFT SIDE */}
                        <div className="flex min-w-0 items-center gap-2.5">
                          {/* Asset icon */}
                          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-[#18181b]">
                            <img
                              src={
                                transaction.asset ===
                                "USDT"
                                  ? "/media/tether-usdt-logo.png"
                                  : "/media/usd-coin-usdc-logo.png"
                              }
                              alt={
                                transaction.asset
                              }
                              className="h-full w-full rounded-full object-contain"
                            />
                          </div>

                          {/* User + date */}
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                              {userId}
                            </div>

                            <div className="text-[11px] text-slate-500 dark:text-white/50">
                              {dateString}
                            </div>
                          </div>
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="ml-3 shrink-0 text-right">
                          {/* Type badge */}
                          <div
                            className={`inline-block rounded-full px-2 py-[3px] text-[11px] ${
                              isCredit
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-red-500/10 text-red-600 dark:text-red-400"
                            }`}
                          >
                            {label}
                          </div>

                          {/* Amount */}
                          <div
                            className={`mt-1 text-[15px] font-bold ${amountClass}`}
                          >
                            {isCredit
                              ? "+"
                              : "-"}{" "}
                            {displayAmount}{" "}
                            {transaction.asset}
                          </div>
                        </div>
                      </Link>
                    );
                  }
                )}
              </div>
            </section>
          );
        }
      )}
    </div>
  );
}