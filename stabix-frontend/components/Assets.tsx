"use client";

import Link from "next/link";

const assets = [
  {
    name: "USDT",
    balance: "74.73",
    symbol: "₮",
    style: "bg-emerald-100 text-emerald-600",
  },
  {
    name: "USDC",
    balance: "0.00",
    symbol: "$",
    style: "bg-blue-100 text-blue-600",
  },
];

export default function Assets() {
  return (
    <section className="px-5 pt-7">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">
          Assets
        </h2>

        {/* Add / Select Primary Asset */}
        <Link
          href="/primary"
          aria-label="Add asset"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-2xl font-light shadow-sm ring-1 ring-slate-100 transition active:scale-90 dark:bg-[#18181b] dark:ring-white/10"
        >
          +
        </Link>
      </div>

      <div className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-100 dark:bg-[#18181b] dark:ring-white/10">
        {assets.map((asset, index) => (
          <div key={asset.name}>
            {index > 0 && (
              <div className="mx-5 border-t border-slate-100 dark:border-white/10" />
            )}

            <button
              type="button"
              className="flex w-full items-center justify-between px-5 py-4 transition active:bg-slate-50 dark:active:bg-white/5"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold ${asset.style}`}
                >
                  {asset.symbol}
                </div>

                <div>
                  <p className="text-sm font-bold">
                    {asset.name}
                  </p>
                </div>
              </div>

              <p className="text-sm font-bold">
                {asset.balance}
              </p>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}