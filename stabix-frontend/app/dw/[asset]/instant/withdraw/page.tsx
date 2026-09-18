"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function InstantWithdrawPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const asset =
    typeof params.asset === "string"
      ? params.asset.toUpperCase()
      : "USDT";

  const network =
    searchParams.get("network")?.toLowerCase() || "ethereum";

  const networkName =
    network.charAt(0).toUpperCase() + network.slice(1);

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-5 pb-10 text-slate-900 dark:bg-[#0b0b0d] dark:text-white">
      <div className="mx-auto w-full max-w-md">

        {/* Header */}
        <header className="flex items-center gap-3 py-7">

          <Link
            href={`/dw/${asset.toLowerCase()}/instant/network?mode=withdraw`}
            aria-label="Back"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl shadow-sm ring-1 ring-slate-200 transition active:scale-90 dark:bg-[#18181b] dark:ring-white/10"
          >
            ←
          </Link>

          <div>
            <h1 className="text-xl font-bold">
              Withdraw {asset}
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Instant · {networkName}
            </p>
          </div>

        </header>

        {/* Selected Network */}
        <section className="mt-3 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18181b]">

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Selected Network
          </p>

          <div className="mt-2 flex items-center justify-between">

            <h2 className="text-2xl font-bold">
              {networkName}
            </h2>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              Instant
            </span>

          </div>

        </section>

        {/* Withdraw Form */}
        <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18181b]">

          <h2 className="text-xl font-bold">
            Withdraw {asset}
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Enter the destination address and amount you
            want to withdraw using the {networkName} network.
          </p>

          {/* Destination Address */}
          <div className="mt-6">

            <label className="text-sm font-semibold">
              Destination Address
            </label>

            <input
              type="text"
              placeholder="Enter wallet address"
              className="mt-2 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-[#0f172a] dark:text-white dark:placeholder:text-slate-500"
            />

          </div>

          {/* Amount */}
          <div className="mt-5">

            <label className="text-sm font-semibold">
              Amount
            </label>

            <div className="relative mt-2">

              <input
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 pr-20 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-[#0f172a] dark:text-white dark:placeholder:text-slate-500"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                {asset}
              </span>

            </div>

          </div>

          {/* Continue */}
          <button
            type="button"
            className="mt-6 w-full rounded-[18px] bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-200 transition active:scale-[0.98] dark:shadow-blue-950"
          >
            Continue
          </button>

        </section>

        {/* Important */}
        <section className="mt-5 rounded-[24px] border border-red-200 bg-red-50 p-6 dark:border-red-500/20 dark:bg-red-500/5">

          <h2 className="text-lg font-bold text-red-900 dark:text-red-300">
            Important
          </h2>

          <ul className="mt-3 space-y-2 text-sm leading-6 text-red-800 dark:text-red-200/80">
            <li>
              • Make sure the destination address is correct.
            </li>

            <li>
              • The address must support {asset} on the{" "}
              {networkName} network.
            </li>

            <li>
              • Blockchain withdrawals cannot normally be reversed.
            </li>

            <li>
              • Review the amount and network carefully before
              submitting.
            </li>
          </ul>

        </section>

      </div>
    </main>
  );
}