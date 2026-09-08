"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function DepositPage() {
  const params = useParams();

  const asset =
    typeof params.asset === "string"
      ? params.asset.toUpperCase()
      : "USDT";

  const network =
    typeof params.network === "string"
      ? params.network
      : "ethereum";

  const networkName =
    network === "ethereum"
      ? "Ethereum ERC20"
      : network === "arbitrum"
      ? "Arbitrum L2"
      : network === "polygon"
      ? "Polygon PoS"
      : network === "base"
      ? "Base L2"
      : network;

  const vaultAddress =
    "0x0201B73BA3d4a43012c84B871c7d5332E176ffcc";

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-5 pb-10 text-slate-900 dark:bg-[#0b0b0d] dark:text-white">
      <div className="mx-auto w-full max-w-md">

        {/* Header */}
        <header className="flex items-center gap-4 py-7">

          <Link
            href={`/dw/${asset.toLowerCase()}/network`}
            aria-label="Back"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-white text-2xl text-slate-900 shadow-sm ring-1 ring-slate-200 transition active:scale-90 dark:bg-[#18181b] dark:text-white dark:ring-white/10"          >
            ←
          </Link>

          <h1 className="text-[25px] font-bold tracking-tight">
            {asset} Deposit
          </h1>

        </header>

        {/* Network */}
        <section className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0b1220] dark:shadow-xl">

          <p className="text-[18px] text-slate-500 dark:text-slate-400">
            Network
          </p>

          <p className="mt-1 text-[25px] font-medium">
            {networkName}
          </p>

        </section>

        {/* Vault Address */}
        <section className="mt-5 rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0b1220] dark:shadow-xl">

          <p className="text-[18px] text-slate-500 dark:text-slate-400">
            Vault Address
          </p>

          <p className="mt-2 break-all text-[20px] leading-8 text-blue-600 dark:text-blue-400">
            {vaultAddress}
          </p>

        </section>

        {/* Form */}
        <section className="mt-6 space-y-5">

          <input
            type="number"
            inputMode="decimal"
            placeholder="Amount"
          className="h-[78px] w-full rounded-[20px] border border-slate-200 bg-white px-6 text-[23px] text-slate-900 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-[#18181b] dark:text-white dark:placeholder:text-slate-400"          />

          <input
            type="text"
            placeholder="Transaction Hash"
          className="h-[78px] w-full rounded-[20px] border border-slate-200 bg-white px-6 text-[23px] text-slate-900 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-[#18181b] dark:text-white dark:placeholder:text-slate-400"          />

          <input
            type="text"
            placeholder="Your Wallet Address"
            className="h-[78px] w-full rounded-[20px] border border-slate-200 bg-white px-6 text-[23px] text-slate-900 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-[#18181b] dark:text-white dark:placeholder:text-slate-400"
          />

          <button
            type="button"
            className="h-[78px] w-full rounded-[20px] bg-emerald-500 text-[21px] font-bold text-white shadow-lg shadow-emerald-950/30 transition active:scale-[0.985]"
          >
            Submit Deposit
          </button>

        </section>

        {/* Premium Deposit Information */}
        <section className="mt-7 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gradient-to-b dark:from-[#101827] dark:to-[#080e19] dark:shadow-2xl">

          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/10 text-xl">
              ⚠️
            </span>

            <h2 className="text-[22px] font-bold">
              Read Before Deposit
            </h2>
          </div>

          <div className="mt-7">

            <h3 className="text-[18px] font-bold text-slate-800 dark:text-slate-200">
              Deposit Instructions
            </h3>

            <div className="mt-3 space-y-3 text-[16px] leading-7 text-slate-500 dark:text-slate-400">

              <p>
                • First approve and deposit your funds
                from your EOA wallet.
              </p>

              <p>
                • Make sure the selected network and asset
                match your actual on-chain transaction.
              </p>

              <p>
                • Send only supported{" "}
               <strong className="text-slate-800 dark:text-slate-200">
                  {asset}
                </strong>{" "}
                tokens to the displayed vault address.
              </p>

              <p>
                • After the transaction is confirmed,
                submit the correct transaction hash,
                amount and your wallet address.
              </p>

              <p>
                • Sending unsupported assets or using the
                wrong network may result in permanent loss.
              </p>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}