"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Mode = "instant" | "advanced" | null;

export default function AssetPage() {
  const params = useParams();

  const asset =
    typeof params.asset === "string"
      ? params.asset.toUpperCase()
      : "USDT";

  const [selectedMode, setSelectedMode] = useState<Mode>(null);
  const [popup, setPopup] = useState<"select" | "instant" | "advanced" | null>(
    null
  );

  const chooseMode = (mode: "instant" | "advanced") => {
    setPopup(mode);
  };

  const confirmMode = () => {
    if (popup === "instant") {
      setSelectedMode("instant");
    }

    if (popup === "advanced") {
      setSelectedMode("advanced");
    }

    setPopup(null);
  };

  const handleTransaction = (action: "deposit" | "withdraw") => {
    if (!selectedMode) {
      setPopup("select");
      return;
    }

   window.location.href = `/dw/${asset.toLowerCase()}/network?mode=${action}`;
  };

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-5 pb-10 text-slate-900 dark:bg-[#0b0b0d] dark:text-white">
      <div className="mx-auto w-full max-w-md">

        {/* Header */}
        <header className="relative pt-8 text-center">

          <Link
            href="/dw"
            aria-label="Back to Select Asset"
            className="absolute left-0 top-8 flex h-10 w-10 items-center justify-center text-2xl text-slate-900 transition active:scale-90 dark:text-white"
          >
            ←
          </Link>

          <div
            className={`mx-auto flex h-24 w-24 items-center justify-center text-7xl font-bold ${
              asset === "USDT"
                ? "text-emerald-500"
                : "text-blue-600"
            }`}
          >
            {asset === "USDT" ? "₮" : "$"}
          </div>

          <h1 className="mt-3 text-3xl font-bold">
            {asset}
          </h1>
        </header>

        {/* Select Mode */}
        <section className="mt-8">
          <p className="mb-5 text-[22px] font-medium text-slate-500 dark:text-slate-400">
            Select Mode
          </p>

          <div className="space-y-4">

            {/* Instant */}
            <button
              type="button"
              onClick={() => chooseMode("instant")}
              className={`flex w-full items-center rounded-[24px] border bg-white px-8 py-7 text-left shadow-sm transition active:scale-[0.985] dark:bg-[#18181b] ${
                selectedMode === "instant"
                  ? "border-blue-500 ring-2 ring-blue-500/30 dark:border-blue-500"
                  : "border-slate-200 dark:border-white/10"
              }`}
            >
              <span className="text-[29px] font-medium">
                Instant
              </span>

              <span className="ml-4 text-lg text-slate-400">
                (Recommended)
              </span>

              {selectedMode === "instant" && (
                <span className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  ✓
                </span>
              )}
            </button>

            {/* Advanced */}
            <button
              type="button"
              onClick={() => chooseMode("advanced")}
              className={`flex w-full items-center rounded-[24px] border bg-white px-8 py-7 text-left shadow-sm transition active:scale-[0.985] dark:bg-[#18181b] ${
                selectedMode === "advanced"
                  ? "border-blue-500 ring-2 ring-blue-500/30 dark:border-blue-500"
                  : "border-slate-200 dark:border-white/10"
              }`}
            >
              <span className="text-[29px] font-medium">
                Advanced
              </span>

              <span className="ml-4 text-lg text-slate-400">
                (Self Custody)
              </span>

              {selectedMode === "advanced" && (
                <span className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  ✓
                </span>
              )}
            </button>

          </div>
        </section>

        {/* Deposit / Withdraw */}
        <section className="mt-10 grid grid-cols-2 gap-5">

          <button
            type="button"
            onClick={() => handleTransaction("deposit")}
            className="rounded-[22px] bg-emerald-500 py-6 text-xl font-bold text-white shadow-lg shadow-emerald-200 transition active:scale-[0.97] dark:shadow-emerald-950"
          >
            Deposit
          </button>

          <button
            type="button"
            onClick={() => handleTransaction("withdraw")}
            className="rounded-[22px] bg-red-500 py-6 text-xl font-bold text-white shadow-lg shadow-red-200 transition active:scale-[0.97] dark:shadow-red-950"
          >
            Withdraw
          </button>

        </section>

        {/* Asset Selected */}
        <section className="mt-10 rounded-[24px] border border-slate-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-[#18181b]">

          <h2 className="text-[22px] font-bold">
            Asset Selected
          </h2>

          <ul className="mt-5 space-y-3 text-[17px] leading-7 text-slate-500 dark:text-slate-400">

            <li>
              • You have selected{" "}
              <strong className="text-slate-800 dark:text-white">
                {asset}
              </strong>{" "}
              for your transaction.
            </li>

            <li>
              • All deposits and withdrawals initiated from
              this page will be processed in{" "}
              <strong className="text-slate-800 dark:text-white">
                {asset}
              </strong>{" "}
              only.
            </li>

            <li>
              • Please ensure you choose the correct network
              before proceeding.
            </li>

            <li>
              • Review all transaction details carefully
              before submission.
            </li>

          </ul>

        </section>

      </div>

      {/* POPUP */}
      {popup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-5 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-[28px] bg-white p-7 shadow-2xl dark:bg-[#18181b]">

            {/* Select Mode Popup */}
            {popup === "select" && (
              <>
                <h2 className="text-2xl font-bold">
                  Select Mode
                </h2>

                <p className="mt-3 text-base leading-6 text-slate-500 dark:text-slate-400">
                  Please select Instant or Advanced mode
                  before continuing.
                </p>

                <button
                  type="button"
                  onClick={() => setPopup(null)}
                  className="mt-7 w-full rounded-[18px] bg-blue-600 py-4 font-bold text-white transition active:scale-[0.98]"
                >
                  OK
                </button>
              </>
            )}

            {/* Instant Popup */}
            {popup === "instant" && (
              <>
                <h2 className="text-2xl font-bold">
                  Instant Mode
                </h2>

                <p className="mt-4 text-base leading-7 text-slate-500 dark:text-slate-400">
                  Instant Mode uses StabiX's instant custody
                  system for fast transaction processing.
                  Withdrawals are processed through the
                  StabiX ledger and validation system.
                </p>

                <div className="mt-7 grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() => setPopup(null)}
                    className="rounded-[18px] border border-slate-200 py-4 font-semibold dark:border-white/10"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={confirmMode}
                    className="rounded-[18px] bg-blue-600 py-4 font-bold text-white"
                  >
                    Confirm
                  </button>

                </div>
              </>
            )}

            {/* Advanced Popup */}
            {popup === "advanced" && (
              <>
                <h2 className="text-2xl font-bold">
                  Advanced Mode
                </h2>

                <p className="mt-4 text-base leading-7 text-slate-500 dark:text-slate-400">
                  Advanced Mode uses self custody.
                  Withdrawals require a valid Merkle Root
                  verification before funds can be released
                  from the vault.
                </p>

                <div className="mt-7 grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() => setPopup(null)}
                    className="rounded-[18px] border border-slate-200 py-4 font-semibold dark:border-white/10"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={confirmMode}
                    className="rounded-[18px] bg-blue-600 py-4 font-bold text-white"
                  >
                    Confirm
                  </button>

                </div>
              </>
            )}

          </div>
        </div>
      )}

    </main>
  );
}