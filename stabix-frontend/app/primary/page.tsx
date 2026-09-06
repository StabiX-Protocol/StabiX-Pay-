"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Balance = {
  asset: string;
  balance: string | number;
};

export default function PrimaryAssetPage() {
  const router = useRouter();

  const [balances, setBalances] = useState<Balance[]>([]);
  const [primary, setPrimary] = useState("USDC");
  const [pendingAsset, setPendingAsset] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /*
   * ==============================
   * LOAD PRIMARY ASSET
   * ==============================
   */

  useEffect(() => {
    const saved = localStorage.getItem(
      "stabix_primary_asset"
    );

    if (saved === "USDT" || saved === "USDC") {
      setPrimary(saved);
    }
  }, []);

  /*
   * ==============================
   * FETCH REALTIME BALANCES
   * ==============================
   */

  const loadBalances = async () => {
    try {
      setLoading(true);

      const data = await apiFetch("/api/balance");

      console.log("PRIMARY ASSET BALANCE:", data);

      if (
        data?.success &&
        Array.isArray(data.balances)
      ) {
        setBalances(data.balances);
      }
    } catch (error) {
      console.error(
        "Primary asset balance error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==============================
   * LOAD BALANCE ON PAGE OPEN
   * ==============================
   */

  useEffect(() => {
    loadBalances();
  }, []);

  /*
   * ==============================
   * GET BALANCE
   * ==============================
   */

  const getBalance = (asset: string) => {
    const item = balances.find(
      (balance) =>
        balance.asset?.toUpperCase() ===
        asset.toUpperCase()
    );

    return Number(item?.balance || 0).toFixed(2);
  };

  /*
   * ==============================
   * SELECT ASSET
   * ==============================
   */

  const selectAsset = (asset: string) => {
    if (asset === primary) return;

    setPendingAsset(asset);
  };

  /*
   * ==============================
   * CONFIRM PRIMARY
   * ==============================
   */

  const confirmPrimary = () => {
    if (!pendingAsset) return;

    localStorage.setItem(
      "stabix_primary_asset",
      pendingAsset
    );

    setPrimary(pendingAsset);
    setPendingAsset(null);

    /*
     * Tell BalanceCard on Home
     * that primary asset changed
     */

    window.dispatchEvent(
      new Event("stabix-primary-asset-change")
    );
  };

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-5 pb-32 text-slate-900 dark:bg-[#0b0b0d] dark:text-white">

      <div className="mx-auto min-h-screen w-full max-w-md">

        {/* HEADER */}

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

        {/* ASSETS */}

        <section className="mt-5 space-y-4">

          {/* USDT */}

          <button
            type="button"
            onClick={() => selectAsset("USDT")}
            className={`flex w-full items-center justify-between rounded-[22px] border px-5 py-5 text-left transition-all active:scale-[0.985] ${
              primary === "USDT"
                ? "border-blue-500/60 bg-[#080b20] shadow-[0_0_0_1px_rgba(59,130,246,0.15)]"
                : "border-white/10 bg-[#080b20]"
            }`}
          >

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-full">
  <img
    src="/media/tether-usdt-logo.png"
    alt="USDT"
    className="h-14 w-14 rounded-full object-contain"
  />
              </div>

              <div>

                <p className="text-xl font-medium">
                  USDT
                </p>

                {primary === "USDT" && (
                  <p className="mt-1 text-[17px] font-bold text-green-500">
                    Primary
                  </p>
                )}

              </div>

            </div>

            <span className="text-xl font-bold">
              {loading ? "..." : getBalance("USDT")}
            </span>

          </button>

          {/* USDC */}

          <button
            type="button"
            onClick={() => selectAsset("USDC")}
            className={`flex w-full items-center justify-between rounded-[22px] border px-5 py-5 text-left transition-all active:scale-[0.985] ${
              primary === "USDC"
                ? "border-blue-500/60 bg-[#080b20] shadow-[0_0_0_1px_rgba(59,130,246,0.15)]"
                : "border-white/10 bg-[#080b20]"
            }`}
          >

            <div className="flex items-center gap-4">

             <div className="flex h-14 w-14 items-center justify-center rounded-full">
  <img
    src="/media/usd-coin-usdc-logo.png"
    alt="USDC"
    className="h-14 w-14 rounded-full object-contain"
  />
              </div>

              <div>

                <p className="text-xl font-medium">
                  USDC
                </p>

                {primary === "USDC" && (
                  <p className="mt-1 text-[17px] font-bold text-green-500">
                    Primary
                  </p>
                )}

              </div>

            </div>

            <span className="text-xl font-bold">
              {loading ? "..." : getBalance("USDC")}
            </span>

          </button>

        </section>

      </div>

      {/* CONFIRMATION POPUP */}

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