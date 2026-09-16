"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type PendingRequest = {
  STRId: string;
  stbx_uid: string;
  asset: string;
  mode?: string | null;
  network?: string | null;
  amount: string | number;
  blockchain_tx_hash?: string | null;
  wallet_address?: string | null;
  type: "deposit" | "withdraw";
  status?: string;
  created_at?: string;
};

type UserBalance = {
  asset: string;
  balance: string | number;
}

export default function ValidatorPanel() {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const [uid, setUid] = useState("");
const [asset, setAsset] = useState("USDC");
const [balance, setBalance] = useState<UserBalance | null>(null);
const [loadingBalance, setLoadingBalance] = useState(false);


const checkBalance = async () => {
  if (!uid.trim()) {
    setMessage("Enter STBX UID");
    return;
  }
  try {
    setLoadingBalance(true);
    setMessage("");
    setBalance(null);

   const data = await apiFetch(
  `/api/validator/users/${encodeURIComponent(
    uid.trim()
  )}/balance?asset=${encodeURIComponent(asset)}`
);

   if (data?.success && Array.isArray(data.balances)) {
  const userBalance = data.balances.find(
    (item: UserBalance) =>
      item.asset?.toUpperCase() === asset.toUpperCase()
  );

  if (userBalance) {
    setBalance(userBalance);
  } else {
    setMessage(`No ${asset} balance found`);
  }
}
    else {
      setMessage(
        data?.message || "Unable to load balance"
      );
    }
  } catch (error) {
    console.error("Validator balance error:", error);
    setMessage("Unable to load balance");
  } finally {
    setLoadingBalance(false);
  }
};


  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await apiFetch(
        "/api/validator/pending-requests"
      );

      if (data?.success && Array.isArray(data.requests)) {
        setRequests(data.requests);
      } else {
        setRequests([]);
        setMessage(
          data?.message || "Unable to load requests"
        );
      }
    } catch (error) {
      console.error(
        "Load pending requests error:",
        error
      );

      setMessage("Unable to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  loadPendingRequests();
}, []);

  const processRequest = async (
    type: "deposit" | "withdraw",
    STRId: string,
    action: "approve" | "reject"
  ) => {
    try {
      setProcessing(STRId);
      setMessage("");

      const endpoint =
        type === "deposit"
          ? `/api/validator/deposit/${action}/${encodeURIComponent(
              STRId
            )}`
          : `/api/validator/withdraw/${action}/${encodeURIComponent(
              STRId
            )}`;

      const data = await apiFetch(endpoint, {
        method: "PATCH",
      });

     if (!data?.success) {
  setMessage(
    data?.message ||
      (action === "approve"
        ? "Approval failed"
        : "Reject failed")
  );
  return;
}

setMessage(
  action === "approve"
    ? "Request approved"
    : "Request rejected"
);

await loadPendingRequests();

} catch (error) {
      console.error(
        "Process validator request error:",
        error
      );

      setMessage("Server error");
    } finally {
      setProcessing(null);
    }
  };

  return (
  <section className="px-5 pt-8 pb-10">
    <div className="border-t border-slate-200 pt-7 dark:border-white/10">

      {/* ==================== HEADER ==================== */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Validator Panel
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Review pending requests
          </p>
        </div>

        {/* Refresh Pending Requests */}
        <button
          type="button"
          onClick={loadPendingRequests}
          disabled={loading}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition active:scale-[0.97] disabled:opacity-50 dark:bg-blue-500"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>


      {/* ==================== USER BALANCE ==================== */}
      <div className="mt-5 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#18181b]">

        {/* Section Title */}
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          User Balance
        </div>

        {/* STBX UID Input */}
        <input
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          type="text"
          placeholder="Enter STBX UID"
          className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 dark:border-white/10 dark:bg-[#111113] dark:focus:border-blue-400"
        />

        {/* Asset + Check Balance */}
        <div className="mt-3 flex gap-2">

          {/* Asset Selector */}
          <select
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none dark:border-white/10 dark:bg-[#111113]"
          >
            <option value="USDC">USDC</option>
            <option value="USDT">USDT</option>
          </select>

          {/* Check Balance */}
          <button
            type="button"
            onClick={checkBalance}
            disabled={loadingBalance}
            className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50 dark:bg-blue-500"
          >
            {loadingBalance ? "Checking..." : "Check Balance"}
          </button>
        </div>

       {/* Balance Result */}
{balance && (
  <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-[#111113]">

    {/* Balance */}
    <div>
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Available Balance
      </div>

      <div className="mt-1 text-2xl font-bold">
        {balance.balance}
      </div>
    </div>

    {/* Asset */}
    <div className="flex items-center gap-2">

      <span className="text-sm font-semibold">
        {balance.asset}
      </span>

      <img
        src={
          balance.asset.toUpperCase() === "USDC"
            ? "/media/usd-coin-usdc-logo.png"
            : "/media/tether-usdt-logo.png"
        }
        alt={balance.asset}
        className="h-7 w-7 shrink-0 object-contain"
      />
    </div>

  </div>
)}
      </div>


      {/* ==================== MESSAGE ==================== */}
      {message && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-medium text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-400">
          {message}
        </div>
      )}


      {/* ==================== PENDING REQUESTS ==================== */}
      <div className="mt-5 space-y-4">

        {requests.map((request) => {
          const isProcessing =
            processing === request.STRId;

          return (
            <div
              key={request.STRId}
              className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]"
            >

              {/* Request Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 dark:border-white/10">
                <div>

                  <div className="text-sm font-bold">
                    {request.type === "deposit"
                      ? "Deposit"
                      : "Withdraw"}
                  </div>

                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {request.amount} {request.asset}
                  </div>
                </div>

                {/* Pending Status */}
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  PENDING
                </span>
              </div>


              {/* Request Details */}
              <div className="space-y-3 px-4 py-4">

                {/* User UID */}
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    User ID
                  </div>

                  <div className="mt-1 break-all text-xs font-semibold">
                    {request.stbx_uid}
                  </div>
                </div>

                {/* Wallet / Transaction Hash */}
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Wallet
                  </div>

                  <div className="mt-1 break-all text-xs font-semibold">
                    {request.type === "deposit"
                      ? request.blockchain_tx_hash || "N/A"
                      : request.wallet_address || "N/A"}
                  </div>
                </div>

                {/* Network + Mode */}
                <div className="grid grid-cols-2 gap-3">

                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Network
                    </div>

                    <div className="mt-1 break-all text-xs font-semibold">
                      {request.network || "N/A"}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Mode
                    </div>

                    <div className="mt-1 break-all text-xs font-semibold">
                      {request.mode || "advanced"}
                    </div>
                  </div>
                </div>

                {/* STR ID */}
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    STR ID
                  </div>

                  <div className="mt-1 break-all text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {request.STRId}
                  </div>
                </div>

                {/* Deposit Transaction Hash */}
                {request.type === "deposit" &&
                  request.blockchain_tx_hash && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Transaction Hash
                      </div>

                      <div className="mt-1 break-all text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {request.blockchain_tx_hash}
                      </div>
                    </div>
                  )}

                {/* Request Time */}
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Time
                  </div>

                  <div className="mt-1 text-xs font-semibold">
                    {request.created_at
                      ? new Date(
                          request.created_at
                        ).toLocaleString()
                      : "N/A"}
                  </div>
                </div>
              </div>


              {/* ==================== APPROVE / REJECT ==================== */}
              <div className="flex gap-3 border-t border-slate-100 px-4 py-4 dark:border-white/10">

                {/* Reject */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() =>
                    processRequest(
                      request.type,
                      request.STRId,
                      "reject"
                    )
                  }
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition active:scale-[0.98] disabled:opacity-50 dark:border-white/10 dark:text-slate-300"
                >
                  {isProcessing
                    ? "Processing..."
                    : "Reject"}
                </button>

                {/* Approve */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() =>
                    processRequest(
                      request.type,
                      request.STRId,
                      "approve"
                    )
                  }
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition active:scale-[0.98] disabled:opacity-50 dark:bg-blue-500"
                >
                  {isProcessing
                    ? "Processing..."
                    : "Approve"}
                </button>
              </div>
            </div>
          );
        })}


        {/* No Pending Requests */}
        {!loading && requests.length === 0 && (
          <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-[#18181b] dark:text-slate-400">
            No pending requests
          </div>
        )}
      </div>

    </div>
  </section>
);
}