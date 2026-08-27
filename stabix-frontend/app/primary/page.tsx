"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const assets = [
  {
    name: "USDT",
    balance: "945.00",
    symbol: "₮",
    iconClass: "bg-emerald-100 text-emerald-600",
  },
  {
    name: "USDC",
    balance: "479.00",
    symbol: "$",
    iconClass: "bg-blue-100 text-blue-600",
  },
];

export default function PrimaryAssetPage() {
  const router = useRouter();

  const [primary, setPrimary] = useState("USDC");
  const [pendingAsset, setPendingAsset] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("stabiX_primary_asset");

    if (saved === "USDT" || saved === "USDC") {
      setPrimary(saved);
    }
  }, []);

  const selectAsset = (asset: string) => {
    setPendingAsset(asset);
  };

  const confirmPrimary = () => {
    if (!pendingAsset) return;

    localStorage.setItem("stabiX_primary_asset", pendingAsset);
    setPrimary(pendingAsset);
    setPendingAsset(null);

  };

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-5 pb-32 text-slate-900 dark:bg-[#0b0b0d] dark:text-white">
      <div className="mx-auto min-h-screen w-full max-w-md">

        {/* Header */}
        <header className="flex items-center justify-between py-7">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-11 w-11 items-center justify-center rounded-full text-3xl transition active:scale-90"
          >
            ←
          </button>

          <h1 className="flex-1 text-center text-[28px] font-bold tracking-tight">
            Select Primary Asset
          </h1>

          <div className="w-11" />
        </header>

        {/* Assets */}
        <section className="mt-5 space-y-4">
          {assets.map((asset) => {
            const isPrimary = primary === asset.name;

            return (
              <button
                key={asset.name}
                type="button"
                onClick={() => selectAsset(asset.name)}
                className={`flex w-full items-center justify-between rounded-[22px] border px-5 py-5 text-left transition-all active:scale-[0.985] ${
                  isPrimary
                    ? "border-blue-500/60 bg-[#080b20] shadow-[0_0_0_1px_rgba(59,130,246,0.15)]"
                    : "border-white/10 bg-[#080b20]"
                }`}
              >
                <div className="flex items-center gap-4">

                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold ${asset.iconClass}`}
                  >
                    {asset.symbol}
                  </div>

                  <div>
                    <p className="text-xl font-medium">
                      {asset.name}
                    </p>

                    {isPrimary && (
                      <p className="mt-1 text-[17px] font-bold text-green-500">
                        Primary
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-xl font-bold">
                  {asset.balance}
                </span>
              </button>
            );
          })}
        </section>
      </div>

      {/* Confirmation Popup */}
      {pendingAsset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-5 backdrop-blur-sm">

          <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#101326] p-6 shadow-2xl">

            <div className="mb-5">
              <p className="text-sm font-medium text-slate-400">
                Primary Asset
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Set {pendingAsset} as Primary?
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Your selected primary asset will be displayed in the main
                balance on the Home page.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPendingAsset(null)}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3.5 font-semibold transition active:scale-[0.98]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmPrimary}
                className="flex-1 rounded-2xl bg-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-950/40 transition active:scale-[0.98]"
              >
                Set as Primary
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}