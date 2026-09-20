"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Transaction = {
  STRId: string;
  type: "sent" | "received" | "deposit" | "withdraw";
  asset: string;
  amount: string | number;
  stbx_uid?: string;
  counterparty?: string | null;
  eoa_address?: string | null;
  created_at: string;
  network?: string | null;
  mode?: string | null;
  blockchain_tx_hash?: string | null;
};

type TransactionDetailProps = {
  transaction: Transaction;
};

export default function TransactionDetail({
  transaction: t,
}: TransactionDetailProps) {
  const searchParams = useSearchParams();

  const backSource = searchParams.get("from");
  const userUid = searchParams.get("user");

  const backHref =
    backSource === "user" && userUid
      ? `/user/${encodeURIComponent(userUid)}`
      : "/history";

  const displayAmount = Number(t.amount).toString ();

  const isCredit =
    t.type === "received" ||
    t.type === "deposit";

  let from = "";
  let to = "";

  if (t.type === "deposit") {
    from = t.eoa_address || "External";
    to = t.stbx_uid || "";
  } else if (t.type === "withdraw") {
    from = t.stbx_uid || "";
    to = t.eoa_address || "External";
  } else {
    from = isCredit
      ? t.counterparty || "System"
      : t.stbx_uid || "";

    to = isCredit
      ? t.stbx_uid || ""
      : t.counterparty || "System";
  }

  let label = "Sent";

  if (t.type === "deposit") {
    label = "Deposit";
  } else if (t.type === "withdraw") {
    label = "Withdraw";
  } else if (t.type === "received") {
    label = "Received";
  }

  const isBlockchainTransaction =
    t.type === "deposit" ||
    t.type === "withdraw";

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900 dark:bg-[#050507] dark:text-white">
      <div className="relative mx-auto min-h-screen w-full max-w-[430px] overflow-hidden px-4 pb-32 pt-5">

        {/* Ambient blue glow */}
        <div className="pointer-events-none absolute left-1/2 top-[-90px] h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/15" />

        {/* Back */}
        <Link
          href={backHref}
          aria-label="Back"
          className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-800 shadow-sm transition active:scale-95 dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>

        {/* Main success section */}
        <div className="relative mt-8 text-center">

          {/* Blue check */}
          <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 shadow-[0_0_45px_rgba(37,99,235,0.18)] dark:border-blue-400/20 dark:bg-blue-500/10 dark:shadow-[0_0_55px_rgba(59,130,246,0.20)]">
            <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-600/30 dark:bg-blue-500">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 12 4.2 4.2L19 6.5" />
              </svg>
            </div>
          </div>

          {/* Status */}
          <div className="mt-5 text-[15px] font-semibold text-blue-600 dark:text-blue-400">
            {label}
          </div>

         <span className="inline-flex w-fit rounded-full border border-emerald-400/25 bg-emerald-500/10 px-1.5 py-[2px] text-[10px] font-semibold leading-none text-emerald-600 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-400">       
         Completed
          </span>

          {/* Amount */}
         <div className="mt-4 flex items-center justify-center gap-2 text-[38px] font-bold tracking-[-1px] text-slate-950 dark:text-white">
  <span>{displayAmount}</span>

  <span className="text-[21px] font-semibold text-slate-500 dark:text-slate-400">
    {t.asset}
  </span>

  <img
    src={
      t.asset.toUpperCase() === "USDC"
        ? "/media/usd-coin-usdc-logo.png"
        : "/media/tether-usdt-logo.png"
    }
    alt={t.asset}
    className="h-6 w-6 shrink-0"
  />
</div>

          {/* Date */}
          <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-500">
            {new Date(t.created_at).toLocaleString()}
          </div>
        </div>

        {/* Details card */}
        <div className="relative mt-8 overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-2xl dark:border-white/[0.08] dark:bg-white/[0.045] dark:shadow-black/20">

          {/* subtle top highlight */}
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

          <div className="space-y-5">

            {/* From */}
            <div>
              <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
                From
              </div>

              <div className="mt-1.5 break-all text-[14px] font-semibold leading-6 text-slate-900 dark:text-white">
                {from}
              </div>
            </div>

            {/* To */}
            <div>
              <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
                To
              </div>

              <div className="mt-1.5 break-all text-[14px] font-semibold leading-6 text-slate-900 dark:text-white">
                {to}
              </div>
            </div>

            {/* STR ID */}
            <div>
              <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
                STR ID
              </div>

              <div className="mt-1.5 break-all text-[14px] font-semibold leading-6 text-blue-600 dark:text-blue-400">
                {t.STRId}
              </div>
            </div>

            {/* Network + Mode only for Deposit / Withdraw */}
            {isBlockchainTransaction && (
              <>
                {/* Network */}
                <div>
                  <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
                    Network
                  </div>

                  <div className="mt-1.5 break-all text-[14px] font-semibold leading-6 text-slate-900 dark:text-white">
                    {t.network || "—"}
                  </div>
                </div>

                {/* Mode */}
                <div>
                  <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
                    Mode
                  </div>

                  <div className="mt-1.5 break-all text-[14px] font-semibold leading-6 text-slate-900 dark:text-white">
                    {t.mode || "—"}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom actions */}
        <div className="relative mt-6 space-y-3">

         {/* Explorer */}
<button
  type="button"
  disabled={!t.blockchain_tx_hash}
  onClick={() => {
    if (!t.blockchain_tx_hash) return;

    const explorerUrls: Record<string, string> = {
      ethereum: "https://sepolia.etherscan.io/tx/",
      bnb: "https://testnet.bscscan.com/tx/",
      arbitrum: "https://sepolia.arbiscan.io/tx/",
      tron: "https://nile.tronscan.org/#/transaction/",
    };

    const network =
      t.network?.toLowerCase() || "";

    const baseUrl = explorerUrls[network];

    if (!baseUrl) return;

    window.open(
      `${baseUrl}${t.blockchain_tx_hash}`,
      "_blank",
      "noopener,noreferrer"
    );
  }}
  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white font-semibold text-slate-900 shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
>
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 3h7v7" />
    <path d="M10 14 21 3" />
    <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
  </svg>

  {(() => {
  const explorerNames: Record<string, string> = {
    ethereum: "View on Etherscan",
    bnb: "View on BscScan",
    arbitrum: "View on Arbiscan",
    tron: "View on TronScan",
  };

  return (
    <>
      {explorerNames[t.network?.toLowerCase() || ""] ||
        "View on Explorer"}
    </>
  );
})()}
</button>

          {/* Done */}
          <Link
            href={backHref}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-blue-600 font-semibold text-white shadow-lg shadow-blue-600/20 transition active:scale-[0.98] dark:bg-blue-500 dark:shadow-blue-500/20"
          >
            Done
          </Link>
        </div>
      </div>
      
<div className="mt-1 flex flex-col items-center justify-center text-center">
  <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 dark:text-slate-500">
    POWERED BY
  </div>

  <div className="mt-3 flex h-14 w-32 items-center justify-center">
    <img
  src="/media/stabix-logo.png"
  alt="StabiX"
  className="h-14 w-auto object-contain"
/>
  </div>

  <div className="mt-2 text-[10px] font-medium tracking-[0.16em] text-slate-400 dark:text-slate-500">
    STABLECOIN PAYMENT INFRASTRUCTURE
  </div>
</div>
    </main>
  );
}
