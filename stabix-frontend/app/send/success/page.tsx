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

  // 0 = center
  // 1 = move tick upward
  // 2 = show transaction details
  const [stage, setStage] = useState(0);

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

    const timer1 = setTimeout(() => {
      setStage(1);
    }, 1200);

    const timer2 = setTimeout(() => {
      setStage(2);
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [searchParams]);

  const assetLogo =
    asset === "USDT"
      ? "/media/tether-usdt-logo.png"
      : "/media/usd-coin-usdc-logo.png";

  const handleDone = () => {
    router.push("/");
  };

  return (
    <main className="min-h-screen w-full bg-white px-6 py-8 text-black dark:bg-black dark:text-white">
  <div className="flex min-h-screen w-full items-center justify-center">
    <div className="relative flex min-h-screen w-full max-w-2xl flex-col justify-center overflow-hidden text-center">
          {/* SUCCESS ICON */}
          <div
            className="relative mx-auto flex h-[150px] w-full items-center justify-center"
            style={{
              transform:
                stage === 0
                  ? "translateY(110px)"
                  : "translateY(0px)",
              transition:
                "transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {/* Ripple 1 */}
            <div className="absolute h-[105px] w-[105px] rounded-full bg-blue-500/20 animate-[stbxRipple_1.4s_ease-out_infinite]" />

            {/* Ripple 2 */}
            <div className="absolute h-[105px] w-[105px] rounded-full bg-blue-500/15 animate-[stbxRipple_1.4s_ease-out_0.4s_infinite]" />

            {/* Blue success circle */}
            <div className="relative flex h-[105px] w-[105px] items-center justify-center rounded-full bg-blue-600 shadow-[0_0_45px_rgba(37,99,235,0.45)] animate-[stbxPop_0.6s_cubic-bezier(0.34,1.56,0.64,1)_both]">
              <svg
                viewBox="0 0 24 24"
                className="h-14 w-14"
              >
                <polyline
                  points="5,12.5 10,17 19,7"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="30"
                  strokeDashoffset="30"
                  className="animate-[stbxTick_0.4s_ease-out_0.5s_forwards]"
                />
              </svg>
            </div>
          </div>

          {/* CONTENT */}
          <div
            className="flex-1"
            style={{
              opacity: stage === 2 ? 1 : 0,
              transform:
                stage === 2
                  ? "translateY(0px)"
                  : "translateY(24px)",
              transition:
                "opacity 500ms ease, transform 500ms ease",
              pointerEvents:
                stage === 2 ? "auto" : "none",
            }}
          >
            {/* Title */}
            <h1 className="text-[25px] font-bold text-blue-500">
              Transaction Successful
            </h1>

            {/* Amount */}
            <div className="mt-5 flex items-center justify-center gap-2">
  <span className="text-[25px] font-semibold text-black dark:text-white">
    {amount} {asset}
  </span>

  <img
    src={assetLogo}
    alt={asset}
    className="h-9 w-9 rounded-full object-contain"
  />
</div>

            {/* Divider */}
            <div className="my-6 h-px bg-black/10 dark:bg-white/10" />

            {/* From */}
            <div className="flex items-start justify-between gap-4 text-left">
              <span className="shrink-0 text-[15px] font-medium text-slate-500 dark:text-slate-400">
                From
              </span>

              <div className="min-w-0 text-right">
                <p className="break-all text-[14px] text-black dark:text-white">
                  {fromUid || "—"}
                </p>

                {fromUsername && (
                  <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                    ({fromUsername})
                  </p>
                )}
              </div>
            </div>

            {/* To */}
            <div className="mt-5 flex items-start justify-between gap-4 text-left">
              <span className="shrink-0 text-[15px] font-medium text-slate-500 dark:text-slate-400">
                To
              </span>

              <div className="min-w-0 text-right">
                <p className="break-all text-[14px] text-black dark:text-white">
                  {toUid || "—"}
                </p>

                {toUsername && (
                  <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                    ({toUsername})
                  </p>
                )}
              </div>
            </div>

            {/* STR ID */}
            <div className="mt-5 flex items-start justify-between gap-4 text-left">
              <span className="shrink-0 text-[15px] font-medium text-slate-500 dark:text-slate-400">
                STR ID
              </span>

              <span className="min-w-0 break-all text-right text-[13px] font-medium text-blue-500">
                {strId || "—"}
              </span>
            </div>

            {/* Time */}
            {time && (
              <p className="mt-5 text-[12px] text-slate-500 dark:text-slate-500">
                {time}
              </p>
            )}

            {/* Done */}
            <button
              type="button"
              onClick={handleDone}
              className="mt-7 w-full rounded-full bg-blue-600 py-4 text-[17px] font-bold text-white shadow-lg transition hover:bg-blue-700 active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes stbxPop {
          0% {
            transform: scale(0);
          }

          60% {
            transform: scale(1.2);
          }

          100% {
            transform: scale(1);
          }
        }

        @keyframes stbxRipple {
          0% {
            transform: scale(0.85);
            opacity: 0.8;
          }

          100% {
            transform: scale(1.7);
            opacity: 0;
          }
        }

        @keyframes stbxTick {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </main>
  );
}