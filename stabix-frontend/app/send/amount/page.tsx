"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Asset = "USDT" | "USDC";

export default function SendAmountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [asset, setAsset] = useState<Asset>("USDC");
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");

  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    const selectedAsset = searchParams.get("asset");

    if (
      selectedAsset === "USDT" ||
      selectedAsset === "USDC"
    ) {
      setAsset(selectedAsset);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadBalance = async () => {
      try {
        setLoadingBalance(true);

        const data = await apiFetch("/api/balance");

        let currentBalance = 0;

        for (const item of data?.balances || []) {
          if (
            item.asset === asset
          ) {
            currentBalance =
              Number(item.balance) || 0;
            break;
          }
        }

        setBalance(currentBalance);
      } catch (error) {
        console.error(
          "Balance fetch error:",
          error
        );

        setBalance(0);
      } finally {
        setLoadingBalance(false);
      }
    };

    loadBalance();
  }, [asset]);

  const displayAmount =
    amount === "" ? "0" : amount;

  const handleKeyPress = (key: string) => {
    setAmount((current) => {
      if (key === "backspace") {
        return current.slice(0, -1);
      }

      if (key === ".") {
        if (current.includes(".")) {
          return current;
        }

        return current === ""
          ? "0."
          : current + ".";
      }

      if (!/^\d$/.test(key)) {
        return current;
      }

      if (current === "0") {
        return key;
      }

      const nextValue = current + key;
      const numericValue = Number(nextValue);

      if (numericValue > balance) {
        return current;
      }

      return nextValue;
    });
  };

  const handleMax = () => {
    if (balance <= 0) return;

    setAmount(
      balance.toString()
    );
  };

  const numericAmount =
    Number(amount) || 0;

  const isValidAmount =
    numericAmount > 0 &&
    numericAmount <= balance;

  const handleConfirm = () => {
    if (!isValidAmount) return;

    // Page 3 baad me connect karenge.
  };

  return (
    <main className="min-h-screen bg-black px-5 pb-6 pt-6 text-white">
      {/* Header */}
      <div className="flex items-center">
        <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-slate-800 shadow-sm dark:bg-[#18181b] dark:text-white"
            aria-label="Go back"
          >                  
            ←
          </button>
      </div>

      {/* Available Balance */}
      <div className="mt-12 flex items-center gap-2 text-[20px]">
        <span className="text-slate-400">
          Available:
        </span>

        <span className="text-slate-300">
          {loadingBalance
            ? "0.00"
            : balance.toFixed(4)}{" "}
          {asset}
        </span>

        <button
          type="button"
          onClick={handleMax}
          disabled={loadingBalance || balance <= 0}
          className="font-semibold text-blue-500 disabled:opacity-40"
        >
          Max
        </button>
      </div>

      {/* Amount */}
      <div className="mt-5 flex items-center justify-center">
        <div className="flex items-center">
          <span
            className={`text-[82px] font-medium leading-none tracking-[-4px] ${
              amount
                ? "text-white"
                : "text-slate-300"
            }`}
          >
            {displayAmount}
          </span>

          <span className="ml-3 text-[58px] font-medium leading-none tracking-[-3px] text-slate-400">
            {asset}
          </span>
        </div>
      </div>

      {/* Keypad */}
      <div className="mt-[120px] grid grid-cols-3 gap-y-8 text-center">
        {[
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          ".",
          "0",
          "backspace",
        ].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => handleKeyPress(key)}
            className="flex h-14 items-center justify-center text-[32px] font-medium text-white active:opacity-50"
            aria-label={
              key === "backspace"
                ? "Delete"
                : key
            }
          >
            {key === "backspace" ? (
              <span className="text-[28px]">
                ⌫
              </span>
            ) : (
              key
            )}
          </button>
        ))}
      </div>

      {/* Confirm */}
      <div className="mt-7">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!isValidAmount}
          className="w-full rounded-full bg-blue-600 py-5 text-[18px] font-bold text-white shadow-lg transition active:scale-[0.98] disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none"
        >
          Confirm
        </button>
      </div>
    </main>
  );
}