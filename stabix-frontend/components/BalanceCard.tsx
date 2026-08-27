"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Balance = {
  asset: string;
  balance: string | number;
};

export default function BalanceCard() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [primaryAsset, setPrimaryAsset] = useState("USDC");
  const [loading, setLoading] = useState(true);

  const loadBalances = async () => {
    try {
      const data = await apiFetch("/api/balance");

      if (data?.success && Array.isArray(data.balances)) {
        setBalances(data.balances);
      }
    } catch (error) {
      console.error("Balance API error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("stabix_primary_asset");

    if (saved) {
      setPrimaryAsset(saved);
    }

    loadBalances();

    const handlePrimaryChange = () => {
      const asset = localStorage.getItem("stabix_primary_asset");

      if (asset) {
        setPrimaryAsset(asset);
      }
    };

    window.addEventListener(
      "stabix-primary-asset-change",
      handlePrimaryChange
    );

    return () => {
      window.removeEventListener(
        "stabix-primary-asset-change",
        handlePrimaryChange
      );
    };
  }, []);

  const selectedBalance =
    balances.find(
      (item) => item.asset.toUpperCase() === primaryAsset.toUpperCase()
    )?.balance ?? "0.00";

  return (
    <section className="px-5 pt-3">
      <div className="relative overflow-hidden rounded-[30px] bg-black px-6 py-7 shadow-xl dark:bg-white">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/[0.05] blur-2xl dark:bg-black/[0.05]" />

        <div className="relative">
          <p className="text-sm font-medium text-white/55 dark:text-black/50">
            Total Balance
          </p>

          <div className="mt-3 flex items-end gap-2">
            <span className="text-[46px] font-bold leading-none tracking-[-0.04em] text-white dark:text-black">
              {loading ? "..." : Number(selectedBalance).toFixed(2)}
            </span>

            <span className="mb-1 text-lg font-semibold text-white/60 dark:text-black/55">
              {primaryAsset}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}