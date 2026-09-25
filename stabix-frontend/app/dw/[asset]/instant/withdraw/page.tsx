"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function InstantWithdrawPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const asset =
    typeof params.asset === "string"
      ? params.asset.toUpperCase()
      : "USDT";

  const network =
    searchParams.get("network")?.toLowerCase() || "ethereum";

  const networkName =
    network.charAt(0).toUpperCase() + network.slice(1);

  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [fee, setFee] = useState<string | null>(null);
  const [feeLoading, setFeeLoading] = useState(true);
  const receivedAmount =
  fee !== null && amount
    ? Math.max(0, Number(amount) - Number(fee))
    : null;

  const [showSuccess, setShowSuccess] = useState(false);
  const [createdWithdrawalId, setCreatedWithdrawalId] = useState("");

  useEffect(() => {
  const loadWithdrawFee = async () => {
    setFeeLoading(true);

    try {
      const response = await fetch(
        `/api/withdraws/fee?asset=${encodeURIComponent(
          asset
        )}&network=${encodeURIComponent(
          network
        )}&mode=instant`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "jwt_token"
            )}`,
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to load withdrawal fee"
        );
      }

      setFee(String(data.fee));

    } catch (err) {
      console.error(
        "WITHDRAW FEE LOAD ERROR:",
        err
      );

      setFee(null);

    } finally {
      setFeeLoading(false);
    }
  };

  loadWithdrawFee();
}, [asset, network]);

  /* --------------------------------
     CONTINUE
  -------------------------------- */

  const handleContinue = () => {
    setError("");

    const cleanAddress = address.trim();
    const cleanAmount = amount.trim();

    if (!cleanAddress) {
      setError("Enter a destination address.");
      return;
    }

    if (!cleanAmount) {
      setError("Enter a withdrawal amount.");
      return;
    }

    const numericAmount = Number(cleanAmount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid withdrawal amount.");
      return;
    }

    setShowConfirmation(true);
  };

  /* --------------------------------
     BACK TO EDIT
  -------------------------------- */

  const handleBackToEdit = () => {
    if (submitting) {
      return;
    }

    setShowConfirmation(false);
    setError("");
  };

  /* --------------------------------
     CONFIRM WITHDRAWAL
  -------------------------------- */

  const handleConfirmWithdraw = async () => {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const cleanAddress = address.trim();
      const cleanAmount = amount.trim();

      const response = await fetch("/api/withdraws", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },

        credentials: "include",

        body: JSON.stringify({
          asset,
          mode: "instant",
          network,
          amount: cleanAmount,
          destination_address: cleanAddress,
        }),
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Withdrawal request failed (${response.status}).`
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Unable to create withdrawal request."
        );
      }

      const withdrawalId = data?.withdrawal?.id;
if (withdrawalId) {
  setShowConfirmation(false);
  setError("");

  alert(
    `Withdrawal request created successfully.\n\nWithdrawal ID: ${withdrawalId}`
  );

  return;
}

    } catch (err) {
      console.error("WITHDRAW SUBMIT ERROR:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while creating withdrawal.";

      setError(message);

    } finally {
      setSubmitting(false);
    }
  };

  /* ===========================================
     CONFIRMATION SCREEN
  ============================================ */

  if (showConfirmation) {
    return (
      <main className="min-h-screen bg-[#f6f7f9] px-5 pb-10 text-slate-900 dark:bg-[#0b0b0d] dark:text-white">
        <div className="mx-auto w-full max-w-md">

          {/* Header */}
          <header className="flex items-center gap-3 py-7">

            <button
              type="button"
              onClick={handleBackToEdit}
              disabled={submitting}
              aria-label="Back"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl shadow-sm ring-1 ring-slate-200 transition active:scale-90 disabled:opacity-50 dark:bg-[#18181b] dark:ring-white/10"
            >
              ←
            </button>

            <div>
              <h1 className="text-xl font-bold">
                Confirm Withdrawal
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Review your withdrawal details
              </p>
            </div>

          </header>

          {/* Main Confirmation Card */}
          <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18181b]">

            {/* Amount */}
            <div className="text-center">

              <p className="text-sm text-slate-500 dark:text-slate-400">
                You are withdrawing
              </p>

              <div className="mt-2 break-all text-4xl font-bold">
                {amount}
              </div>

              <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                {asset}
              </p>

            </div>

            <div className="my-6 h-px bg-slate-200 dark:bg-white/10" />

            {/* Details */}
            <div className="space-y-5">

              {/* Network */}
              <div className="flex items-start justify-between gap-5">

                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Network
                </span>

                <span className="text-right text-sm font-semibold">
                  {networkName}
                </span>

              </div>

              {/* Destination */}
              <div className="flex items-start justify-between gap-5">

                <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
                  Destination
                </span>

                <span className="max-w-[220px] break-all text-right text-sm font-semibold">
                  {address}
                </span>

              </div>

              {/* Fee */}
             <div className="flex items-start justify-between gap-5">

             <span className="text-sm text-slate-500 dark:text-slate-400">
             Withdrawal fee
              </span>

             <span className="text-right text-sm font-semibold">
              {feeLoading
              ? "Calculating..."
                 : fee !== null
                ? `${Number(fee)} ${asset}`
                : "Unavailable"}
              </span>
             </div>

             {/* You will receive */}
            <div className="flex items-start justify-between gap-5 mt-4">

             <span className="text-sm text-slate-500 dark:text-slate-400">
                You will receive
             </span>

               <span className="text-right text-sm font-semibold text-emerald-500">
                 {feeLoading
               ? "Calculating..."
                : receivedAmount !== null
                ? `${receivedAmount} ${asset}`
                  : "—"}
               </span> 
                 </div>

              {/* Processing */}
              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Processing
                </span>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  Instant
                </span>

              </div>

            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Confirm */}
            <button
              type="button"
              onClick={handleConfirmWithdraw}
              disabled={submitting}
              className="mt-7 w-full rounded-[18px] bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-200 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-blue-950"
            >
              {submitting
                ? "Submitting withdrawal..."
                : "Confirm Withdrawal"}
            </button>

            {/* Edit */}
            <button
              type="button"
              onClick={handleBackToEdit}
              disabled={submitting}
              className="mt-3 w-full rounded-[18px] border border-slate-200 bg-white py-4 font-semibold text-slate-700 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#18181b] dark:text-slate-200"
            >
              Edit Details
            </button>

          </section>

          {/* Warning */}
          <section className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-amber-500/5">

            <h2 className="font-bold text-amber-900 dark:text-amber-300">
              Check before confirming
            </h2>

            <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-800 dark:text-amber-200/80">

              <li>
                • Verify the destination address carefully.
              </li>

              <li>
                • Make sure the network is {networkName}.
              </li>

              <li>
                • Only send {asset} to a compatible address.
              </li>

              <li>
                • Blockchain withdrawals generally cannot be reversed.
              </li>

            </ul>

          </section>

        </div>
      </main>
    );
  }

  /* ============================================
     WITHDRAWAL FORM
  ============================================ */

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

        {/* Network */}
        <section className="mt-3 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#18181b]">

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Network
              </p>

              <h2 className="mt-1 text-lg font-bold">
                {networkName}
              </h2>

            </div>

            <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              Instant
            </span>

          </div>

        </section>

        {/* Withdrawal Form */}
        <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18181b]">

          <h2 className="text-xl font-bold">
            Withdrawal Details
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Enter the wallet address and amount you want to withdraw.
          </p>

          {/* Destination Address */}
          <div className="mt-6">

            <label
              htmlFor="destination-address"
              className="text-sm font-semibold"
            >
              Destination Address
            </label>

            <input
              id="destination-address"
              type="text"
              value={address}
              onChange={(event) => {
                setAddress(event.target.value);
                setError("");
              }}
              placeholder="Enter wallet address"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              disabled={submitting}
              className="mt-2 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#0f172a] dark:text-white dark:placeholder:text-slate-500"
            />

            <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Only send {asset} to a compatible {networkName} address.
            </p>

          </div>

          {/* Amount */}
          <div className="mt-5">

            <div className="flex items-center justify-between">

              <label
                htmlFor="withdraw-amount"
                className="text-sm font-semibold"
              >
                Amount
              </label>

              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {asset}
              </span>

            </div>

            <div className="relative mt-2">

              <input
                id="withdraw-amount"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setError("");
                }}
                placeholder="0.00"
                disabled={submitting}
                className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 pr-20 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#0f172a] dark:text-white dark:placeholder:text-slate-500"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                {asset}
              </span>

            </div>

          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Continue */}
          <button
            type="button"
            onClick={handleContinue}
            disabled={submitting}
            className="mt-6 w-full rounded-[18px] bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-200 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-blue-950"
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
              • Check the destination address carefully.
            </li>

            <li>
              • Make sure the selected network matches the destination.
            </li>

            <li>
              • Only send {asset} using the selected network.
            </li>

            <li>
              • Blockchain withdrawals cannot normally be reversed.
            </li>

          </ul>

        </section>

      </div>
    </main>
  );
}