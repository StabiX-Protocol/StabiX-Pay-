"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { QRCodeSVG} from "qrcode.react";

export default function InstantDepositPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const asset =
    typeof params.asset === "string"
      ? params.asset.toUpperCase()
      : "USDT";

  const network =
    searchParams.get("network")?.toLowerCase() || "ethereum";

    const mode = "instant";

  const networkName =
    network.charAt(0).toUpperCase() + network.slice(1);

const [depositAddress, setDepositAddress] = useState("");
const [loadingAddress, setLoadingAddress] = useState(true);
const [copied, setCopied] = useState(false);

useEffect(() => {
  const loadDepositAddress = async () => {
    try {
      // 1. FIRST: Load the deposit address
      const data = await apiFetch(
        `/api/deposits/address?network=${encodeURIComponent(network)}&mode=instant`
      );

      console.log(
        "Deposit address response:",
        data
      );

      if (!data?.success || !data?.address) {
        throw new Error(
          data?.message ||
          "Deposit address not available"
        );
      }

      setDepositAddress(data.address);

      // 2. SECOND: Create deposit intent
     let intentData;

try {
  intentData = await apiFetch(
    "/api/deposits/intent",
    {
      method: "POST",
      body: JSON.stringify({
        asset,
        mode,
        network,
      }),
    }
  );

  console.log(
    "Deposit intent created:",
    intentData
  );
} catch (error) {
  console.error(
    "CREATE DEPOSIT INTENT FAILED:",
    error
  );

  return;
}

      // 3. THIRD: Attach the exact address to the intent
      if (
        intentData?.success &&
        intentData?.intent?.id &&
        data?.addressId
      ) {
        const attachData = await apiFetch(
          "/api/deposits/intent/address",
          {
            method: "POST",
            body: JSON.stringify({
              intentId: intentData.intent.id,
              depositAddressId: data.addressId,
            }),
          }
        );

        console.log(
          "Deposit intent address attached:",
          attachData
        );
      }
    } catch (error) {
      console.error(
        "DEPOSIT FLOW ERROR:",
        error
      );
    } finally {
      setLoadingAddress(false);
    }
  };

  loadDepositAddress();
}, [asset, mode, network]);

const handleCopyAddress = async () => {
  if (!depositAddress) return;

  await navigator.clipboard.writeText(depositAddress);
};

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-5 pb-10 text-slate-900 dark:bg-[#0b0b0d] dark:text-white">
      <div className="mx-auto w-full max-w-md">

        {/* Header */}
        <header className="flex items-center gap-3 py-7">

          <Link
            href={`/dw/${asset.toLowerCase()}/instant/network?mode=deposit`}
            aria-label="Back"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl shadow-sm ring-1 ring-slate-200 transition active:scale-90 dark:bg-[#18181b] dark:ring-white/10"
          >
            ←
          </Link>

          <div>
            <h1 className="text-xl font-bold">
              Deposit {asset}
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Instant · {networkName}
            </p>
          </div>

        </header>

        {/* Network */}
        <section className="mt-3 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18181b]">

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Selected Network
          </p>

          <div className="mt-2 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {networkName}
            </h2>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              Instant
            </span>
          </div>

        </section>

        {/* Deposit Address */}
        <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18181b]">

          <h2 className="text-xl font-bold">
            Deposit Address
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Send only {asset} on the {networkName} network
            to the deposit address below.
          </p>

          <div className="mt-5 flex flex-col items-center rounded-[18px] bg-slate-100 p-5 dark:bg-[#0f172a]">

  {depositAddress && (
    <div className="rounded-2xl bg-white p-4">
      <QRCodeSVG
        value={depositAddress}
        size={190}
        level="M"
      />
    </div>
  )}

  <p className="mt-4 w-full break-all text-center text-sm font-medium text-slate-700 dark:text-slate-300">
    {depositAddress}
  </p>

</div>
          <button
  type="button"
  disabled={!depositAddress}
  onClick={async () => {
    if (!depositAddress) return;

    await navigator.clipboard.writeText(depositAddress);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }}
  className="mt-4 w-full rounded-[18px] bg-blue-600 py-4 font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
>
  {copied ? "Copied ✓" : "Copy Address"}
</button>

        </section>

        {/* Important */}
        <section className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50 p-6 dark:border-amber-500/20 dark:bg-amber-500/5">

          <h2 className="text-lg font-bold text-amber-900 dark:text-amber-300">
            Important
          </h2>

          <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-800 dark:text-amber-200/80">
            <li>
              • Send only {asset} using {networkName}.
            </li>
            <li>
              • Sending another asset may result in permanent loss.
            </li>
            <li>
              • Always verify the network before sending.
            </li>
          </ul>

        </section>

      </div>
    </main>
  );
}