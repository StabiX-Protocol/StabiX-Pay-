"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Asset = "USDT" | "USDC";

type User = {
  stbx_uid?: string;
  username?: string;
  profile_image?: string | null;
};

export default function SendConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [asset, setAsset] = useState<Asset>("USDC");
  const [amount, setAmount] = useState("0");
  const [recipientUid, setRecipientUid] = useState("");

  const [myUser, setMyUser] = useState<User | null>(null);
  const [recipient, setRecipient] = useState<User | null>(null);

  useEffect(() => {
    const selectedAsset = searchParams.get("asset");
    const selectedAmount = searchParams.get("amount");
    const selectedRecipient = searchParams.get("recipient");

    if (
      selectedAsset === "USDT" ||
      selectedAsset === "USDC"
    ) {
      setAsset(selectedAsset);
    }

    if (selectedAmount) {
      setAmount(selectedAmount);
    }

    if (selectedRecipient) {
      setRecipientUid(selectedRecipient);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const myUid =
          localStorage.getItem("stbx_uid");

        if (myUid) {
          const myData = await apiFetch(
            `/api/users/${encodeURIComponent(myUid)}`
          );

          setMyUser(
            myData?.user || myData
          );
        }

        if (recipientUid) {
          const recipientData =
            await apiFetch(
              `/api/users/${encodeURIComponent(
                recipientUid
              )}`
            );

          setRecipient(
            recipientData?.user ||
              recipientData
          );
        }
      } catch (error) {
        console.error(
          "Confirm page user fetch error:",
          error
        );
      }
    };

    loadUsers();
  }, [recipientUid]);

  const assetLogo =
    asset === "USDT"
      ? "/media/tether-usdt-logo.png"
      : "/media/usd-coin-usdc-logo.png";

  const handleReject = () => {
    router.back();
  };

  const handleConfirm = () => {
    // Actual transaction logic baad me.
  };

  return (
    <main className="min-h-screen bg-black px-5 pb-6 pt-6 text-white">
      {/* Back */}
       <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-slate-800 shadow-sm dark:bg-[#18181b] dark:text-white"
            aria-label="Go back"
          >                  
            ←
          </button>

      {/* Heading */}
      <div className="mt-8">
        <h1 className="text-[42px] font-bold leading-none tracking-[-2px]">
          Confirm{" "}
          <span className="text-green-500">
            Send
          </span>
        </h1>
      </div>

      <div className="mt-12 border-t border-white/20 pt-7">
        {/* Asset + Amount */}
        <div className="flex items-center justify-center gap-3">
          <img
            src={assetLogo}
            alt={asset}
            className="h-12 w-12 rounded-full object-contain"
          />

          <div className="flex items-center justify-center gap-3">
            <span className="text-[34px] font-medium text-white">
              -{amount}
            </span>

            <span className="text-[30px] font-medium text-slate-400">
              {asset}
            </span>
          </div>
        </div>

        <div className="mt-7 border-b border-white/20" />

        {/* Fee */}
        <div className="mt-7 flex items-center justify-between">
          <span className="text-[18px] font-medium text-white">
            Fee
          </span>

          <span className="text-[18px] text-slate-400">
            0 {asset}
          </span>
        </div>

        {/* From */}
        <div className="mt-8 flex items-start justify-between gap-5">
          <span className="shrink-0 text-[18px] font-medium text-white">
            From
          </span>

          <div className="min-w-0 text-right">
            <p className="break-all text-[16px] text-slate-400">
              {myUser?.stbx_uid || "Loading..."}
            </p>

            <p className="mt-1 text-[16px] font-medium text-white">
              ({myUser?.username || "Loading..."})
            </p>
          </div>
        </div>

        {/* To */}
        <div className="mt-8 flex items-start justify-between gap-5">
          <span className="shrink-0 text-[18px] font-medium text-white">
            To
          </span>

          <div className="min-w-0 text-right">
            <p className="break-all text-[16px] text-slate-400">
              {recipient?.stbx_uid ||
                recipientUid}
            </p>

            <p className="mt-1 text-[16px] font-medium text-white">
              ({recipient?.username || "Loading..."})
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="fixed bottom-5 left-0 right-0 mx-auto flex w-full max-w-[430px] gap-3 px-5">
        <button
          type="button"
          onClick={handleReject}
          className="flex-1 rounded-full bg-[#222222] py-5 text-[18px] font-bold text-white transition active:scale-[0.98]"
        >
          Reject
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 rounded-full bg-blue-600 py-5 text-[18px] font-bold text-white transition active:scale-[0.98]"
        >
          Confirm
        </button>
      </div>
    </main>
  );
}