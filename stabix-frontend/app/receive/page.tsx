"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Asset = "USDT" | "USDC";

type User = {
  stbx_uid?: string;
};

export default function ReceivePage() {
  const router = useRouter();

  const [asset, setAsset] = useState<Asset>("USDC");
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedAsset =
      localStorage.getItem("stabix_primary_asset");

    if (
      savedAsset === "USDT" ||
      savedAsset === "USDC"
    ) {
      setAsset(savedAsset);
    }
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stbxUid =
          localStorage.getItem("stbx_uid");

        if (!stbxUid) {
          setLoading(false);
          return;
        }

        const data = await apiFetch(
          `/api/users/${encodeURIComponent(stbxUid)}`
        );

        const user: User =
          data?.user || data;

        setUid(
          user?.stbx_uid || stbxUid
        );
      } catch (error) {
        console.error(
          "Receive user fetch error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const copyWallet = async () => {
    if (!uid) return;

    try {
      await navigator.clipboard.writeText(uid);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy error:", error);
    }
  };

  const assetLogo =
    asset === "USDT"
      ? "/media/tether-usdt-logo.png"
      : "/media/usd-coin-usdc-logo.png";

  const qrUrl = uid
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        uid
      )}`
    : "";

  return (
    <main className="min-h-screen bg-background px-5 pb-28 pt-6 text-foreground">
      <div className="mx-auto w-full max-w-[430px]">

        {/* Header */}
        <div className="mb-8 flex items-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-foreground shadow-sm ring-1 ring-border transition active:scale-95"
            aria-label="Back"
          >
            ←
          </button>

          <h1 className="ml-4 text-[28px] font-bold">
            Receive
          </h1>
        </div>

        {/* Asset */}
        <section className="mt-4">
          <div className="flex flex-col items-center justify-center">
            <img
              src={assetLogo}
              alt={asset}
              className="h-16 w-16 rounded-full object-contain"
            />

            <h2 className="mt-3 text-[22px] font-bold">
              Receive {asset}
            </h2>

            <p className="mt-2 text-center text-[14px] text-muted">
              Only Send Your Assets To This QR Code.
            </p>
          </div>
        </section>

        {/* QR */}
        <section className="mt-7 flex justify-center">
          <div className="flex h-[200px] w-[200px] items-center justify-center">
            {loading ? (
              <span className="text-sm text-muted">
                Loading...
              </span>
            ) : uid ? (
              <img
                src={qrUrl}
                alt={`${asset} Receive QR Code`}
                width={200}
                height={200}
                className="h-[200px] w-[200px]"
              />
            ) : (
              <span className="text-sm text-muted">
                UID unavailable
              </span>
            )}
          </div>
        </section>

        {/* UID Label */}
        <div className="mt-7 text-center">
          <div className="text-[14px] font-semibold text-muted">
            StabiX UID
          </div>
        </div>

        {/* UID + Copy */}
        <div className="mt-3 flex min-h-[58px] items-center rounded-[18px] bg-input px-4 ring-1 ring-border">
          <span className="min-w-0 flex-1 break-all text-[16px] font-semibold">
            {loading
              ? "Loading..."
              : uid || "Unavailable"}
          </span>

          <button
            type="button"
            onClick={copyWallet}
            disabled={!uid}
            className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted transition active:scale-90 disabled:opacity-40"
            aria-label="Copy StabiX UID"
          >
            {copied ? (
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17L4 12" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
              >
                <rect
                  x="9"
                  y="9"
                  width="13"
                  height="13"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />

                <rect
                  x="2"
                  y="2"
                  width="13"
                  height="13"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            )}
          </button>
        </div>

       {/* COPY SUCCESS POPUP */}

      {copied && (
        <div className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 animate-[fadeIn_0.15s_ease-out]">

          <div className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-xl">

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>

            StabiX UID copied

          </div>

        </div>
      )}

      </div>
    </main>
  );
}