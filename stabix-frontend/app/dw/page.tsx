"use client";

import Link from "next/link";

const assets = [
  {
    name: "USDT",
    balance: "74.73",
    symbol: "₮",
    iconClass: "bg-emerald-100 text-emerald-600",
  },
  {
    name: "USDC",
    balance: "0.00",
    symbol: "$",
    iconClass: "bg-blue-100 text-blue-600",
  },
];

export default function DWPage() {


  return (
    <main className="min-h-screen bg-[#f6f7f9] px-5 pb-32 text-slate-900 dark:bg-[#0b0b0d] dark:text-white">
      <div className="mx-auto w-full max-w-md">

        {/* Header */}
        <header className="flex items-center gap-3 py-6">
          <Link
       href="/"
       aria-label="Go to Home"
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl shadow-sm ring-1 ring-slate-100 transition active:scale-90 dark:bg-[#18181b] dark:ring-white/10"
          >
       ←
      </Link>

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
    <div
      className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold ${asset.iconClass}`}
    >
      {asset.symbol}
    </div>

    <span className="text-xl font-medium">
      {asset.name}
    </span>
  </div>

  <span className="text-xl font-bold">
    {asset.balance}
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
            <div className="flex items-center justify-between border-b border-slate-200 pb-5 dark:border-white/10">
              <div>
                <p className="text-lg font-medium">
                  Withdraw
                </p>

                <p className="text-sm text-slate-400">
                  12 Jul, 01:05 am
                </p>
              </div>

              <p className="text-lg font-semibold text-red-500">
                - 2 USDT
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}