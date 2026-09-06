"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Balance = {
  asset: string;
  balance: string | number;
};

const assets = [
  {
    name: "USDT",
    logo: "/media/tether-usdt-logo.png",
  },
  {
    name: "USDC",
    logo: "/media/usd-coin-usdc-logo.png",
  },
];

export default function Assets() {
  const [balances, setBalances] = useState<Balance[]>([]);

  const loadBalances = async () => {
    try {
      const data = await apiFetch("/api/balance");

      console.log("ASSETS BALANCE API:", data);

      if (
        data?.success &&
        Array.isArray(data.balances)
      ) {
        setBalances(data.balances);
      }
    } catch (error) {
      console.error(
        "Assets balance API error:",
        error
      );
    }
  };

  useEffect(() => {
    loadBalances();

    const handleBalanceUpdate = () => {
      loadBalances();
    };

    const handlePrimaryChange = () => {
      loadBalances();
    };

    window.addEventListener(
      "stabix-balance-update",
      handleBalanceUpdate
    );

    window.addEventListener(
      "stabix-primary-asset-change",
      handlePrimaryChange
    );

    return () => {
      window.removeEventListener(
        "stabix-balance-update",
        handleBalanceUpdate
      );

      window.removeEventListener(
        "stabix-primary-asset-change",
        handlePrimaryChange
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
    <section className="px-5 pt-7">

      <div className="mb-4 flex items-center justify-between">

        <h2 className="text-xl font-bold tracking-tight">
          Assets
        </h2>

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

               <div className="flex h-11 w-11 items-center justify-center rounded-full">
  <img
    src={asset.logo}
    alt={asset.name}
    className="h-11 w-11 rounded-full object-contain"
  />
</div>

                <div>
                  <p className="text-sm font-bold">
                    {asset.name}
                  </p>
                </div>

              </div>

              <p className="text-sm font-bold">
                {getBalance(asset.name)}
              </p>

            </button>

          </div>

        ))}

      </div>

    </section>
  );
}