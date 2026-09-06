"use client";

import Link from "next/link";

type Transaction = {
  STRId: string;
  type: "sent" | "received" | "deposit" | "withdraw";
  asset: string;
  amount: string | number;
  stbx_uid?: string;
  counterparty?: string | null;
  eoa_address?: string | null;
  created_at: string;
};

type TransactionDetailProps = {
  transaction: Transaction;
};

export default function TransactionDetail({
  transaction: t,
}: TransactionDetailProps) {
  const displayAmount = Number(t.amount).toFixed(2);

  const isCredit =
    t.type === "received" ||
    t.type === "deposit";

  let from = "";
  let to = "";

  /*
   * Deposit:
   * External wallet → StabiX UID
   */
  if (t.type === "deposit") {
    from = t.eoa_address || "External";
    to = t.stbx_uid || "";
  }

  /*
   * Withdraw:
   * StabiX UID → External wallet
   */
  else if (t.type === "withdraw") {
    from = t.stbx_uid || "";
    to = t.eoa_address || "External";
  }

  /*
   * Send / Received:
   * Counterparty ↔ authenticated user's StabiX UID
   */
  else {
    from = isCredit
      ? t.counterparty || "System"
      : t.stbx_uid || "";

    to = isCredit
      ? t.stbx_uid || ""
      : t.counterparty || "System";
  }

  let label = "Sent";

  if (t.type === "deposit") {
    label = "Deposit";
  } else if (t.type === "withdraw") {
    label = "Withdraw";
  } else if (t.type === "received") {
    label = "Received";
  }

  const labelClass =
    t.type === "deposit" ||
    t.type === "received"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-red-600 dark:text-red-400";

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-slate-900 dark:bg-[#0b0b0d] dark:text-white">
      <div className="relative px-4 pb-28 pt-5">
        {/* Back */}
        <Link
          href="/history"
          aria-label="Back to transaction history"
          className="absolute left-4 top-5 flex h-9 w-9 items-center justify-center rounded-[10px] bg-white text-xl shadow-sm dark:bg-[#18181b]"
        >
          ←
        </Link>

        {/* Amount + basic information */}
        <div className="mt-10 text-center">
          <div className="text-[36px] font-bold tracking-[0.5px]">
            {displayAmount} {t.asset}
          </div>

          <div
            className={`mt-1.5 text-[15px] font-semibold ${labelClass}`}
          >
            {label}
          </div>

          <div className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            ✔ Completed
          </div>

          <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {new Date(t.created_at).toLocaleString()}
          </div>

          <div className="mt-2 break-all text-xs font-semibold text-blue-600 dark:text-blue-400">
            STR ID : {t.STRId}
          </div>
        </div>

        {/* Divider */}
        <div className="my-5 h-px bg-slate-200 dark:bg-white/10" />

        {/* From / To */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#18181b]">
          <div className="mb-3.5">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              From
            </div>

            <div className="break-all text-sm font-semibold">
              {from}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              To
            </div>

            <div className="break-all text-sm font-semibold">
              {to}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}