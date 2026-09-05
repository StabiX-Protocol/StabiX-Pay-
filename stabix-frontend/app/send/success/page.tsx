"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Asset = "USDT" | "USDC";

export default function SendSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [asset, setAsset] = useState<Asset>("USDC");
  const [amount, setAmount] = useState("0");

  const [fromUid, setFromUid] = useState("");
  const [fromUsername, setFromUsername] = useState("");

  const [toUid, setToUid] = useState("");
  const [toUsername, setToUsername] = useState("");

  const [strId, setStrId] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const selectedAsset = searchParams.get("asset");
    const selectedAmount = searchParams.get("amount");

    if (
      selectedAsset === "USDT" ||
      selectedAsset === "USDC"
    ) {
      setAsset(selectedAsset);
    }

    if (selectedAmount) {
      setAmount(selectedAmount);
    }

    setFromUid(
      searchParams.get("from") ||
        localStorage.getItem("stbx_uid") ||
        ""
    );

    setFromUsername(
      searchParams.get("fromUsername") || ""
    );

    setToUid(
      searchParams.get("to") ||
        searchParams.get("recipient") ||
        ""
    );

    setToUsername(
      searchParams.get("toUsername") || ""
    );

    setStrId(
      searchParams.get("strId") ||
        searchParams.get("STRId") ||
        ""
    );

    setTime(
      new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, [searchParams]);

  const assetLogo =
    asset === "USDT"
      ? "/media/tether-usdt-logo.png"
      : "/media/usd-coin-usdc-logo.png";

  const handleDone = () => {
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-black px-5 py-6 text-white">
      <div className="flex min-h-[calc(100vh-48px)] items-center justify-center">
        <div className="w-full max-w-[390px] rounded-[30px] border border-white/10 bg-[#111111] px-6 py-8 text-center shadow-2xl">

          {/* Success Animation */}
          <div className="mx-auto mb-6 flex h-[125px] w-[125px] items-center justify-center">
            <svg
              viewBox="0 0 120 120"
              className="h-full w-full"
            >
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#2a2a2a"
                strokeWidth="9"
              />

              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#22c55e"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray="327"
                strokeDashoffset="0"
                transform="rotate(-90 60 60)"
                className="animate-[successRing_.9s_ease-out]"
              />

              <polyline
                points="38,63 54,78 83,45"
                fill="none"
                stroke="#22c55e"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="70"
                strokeDashoffset="0"
                className="animate-[successTick_.45s_ease-out_.65s_both]"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-[25px] font-bold text-green-500">
            Transaction Successful
          </h1>

          {/* Amount */}
          <div className="mt-5 flex items-center justify-center gap-2">
            <img
              src={assetLogo}
              alt={asset}
              className="h-9 w-9 rounded-full object-contain"
            />

            <span className="text-[25px] font-semibold text-white">
              {amount} {asset}
            </span>
          </div>

          {/* Divider */}
          <div className="my-6 h-px bg-white/10" />

          {/* From */}
          <div className="flex items-start justify-between gap-4 text-left">
            <span className="shrink-0 text-[15px] font-medium text-slate-400">
              From
            </span>

            <div className="min-w-0 text-right">
              <p className="break-all text-[14px] text-white">
                {fromUid || "—"}
              </p>

              {fromUsername && (
                <p className="mt-1 text-[13px] text-slate-400">
                  ({fromUsername})
                </p>
              )}
            </div>
          </div>

          {/* To */}
          <div className="mt-5 flex items-start justify-between gap-4 text-left">
            <span className="shrink-0 text-[15px] font-medium text-slate-400">
              To
            </span>

            <div className="min-w-0 text-right">
              <p className="break-all text-[14px] text-white">
                {toUid || "—"}
              </p>

              {toUsername && (
                <p className="mt-1 text-[13px] text-slate-400">
                  ({toUsername})
                </p>
              )}
            </div>
          </div>

          {/* STR ID */}
          <div className="mt-5 flex items-start justify-between gap-4 text-left">
            <span className="shrink-0 text-[15px] font-medium text-slate-400">
              STR ID
            </span>

            <span className="min-w-0 break-all text-right text-[13px] font-medium text-blue-400">
              {strId || "—"}
            </span>
          </div>

          {/* Time */}
          {time && (
            <p className="mt-5 text-[12px] text-slate-500">
              {time}
            </p>
          )}

          {/* Done */}
          <button
            type="button"
            onClick={handleDone}
            className="mt-7 w-full rounded-full bg-blue-600 py-4 text-[17px] font-bold text-white shadow-lg transition active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes successRing {
          from {
            stroke-dashoffset: 327;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes successTick {
          from {
            stroke-dashoffset: 70;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </main>
  );
}