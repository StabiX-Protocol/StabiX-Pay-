"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import AppPopup from "@/components/AppPopup";

type Asset = "USDT" | "USDC";

type Recipient = {
  stbx_uid?: string;
  username?: string;
  profile_image?: string | null;
};

export default function SendPage() {
  const router = useRouter();

  const [asset, setAsset] = useState<Asset>("USDC");
  const [recipientUid, setRecipientUid] = useState("");
  const [recipient, setRecipient] = useState<Recipient | null>(null);

  const [loadingRecipient, setLoadingRecipient] = useState(false);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    const savedAsset =
      localStorage.getItem("stabix_primary_asset");

    if (savedAsset === "USDT" || savedAsset === "USDC") {
      setAsset(savedAsset);
    }
  }, []);

  const showPopup = (message: string) => {
    setPopupMessage(message);
    setPopupOpen(true);
  };

  const lookupRecipient = async (uid: string) => {
    const value = uid.trim();

    setRecipient(null);

    if (!value) return;

    try {
      setLoadingRecipient(true);

      const data = await apiFetch(
        `/api/users/${encodeURIComponent(value)}`
      );

      const user = data?.user || data;

      if (!user) {
        showPopup("StabiX UID not found.");
        return;
      }

      setRecipient({
        stbx_uid: user.stbx_uid || value,
        username: user.username || "Unknown User",
        profile_image:
          user.profile_image ||
          user.profileImage ||
          null,
      });
    } catch (error) {
      console.error(
        "Recipient lookup error:",
        error
      );

      setRecipient(null);

      showPopup(
        error instanceof Error
          ? error.message
          : "StabiX UID not found."
      );
    } finally {
      setLoadingRecipient(false);
    }
  };

  const handleUidChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    setRecipientUid(value);
    setRecipient(null);
  };

  const handleNext = () => {
    if (!recipient) {
      showPopup("Please enter a valid StabiX UID.");
      return;
    }

    const myUid =
      localStorage.getItem("stbx_uid")?.trim();

    const receiverUid =
      recipient.stbx_uid?.trim() ||
      recipientUid.trim();

    if (
      myUid &&
      receiverUid &&
      myUid.toLowerCase() ===
        receiverUid.toLowerCase()
    ) {
      showPopup("Self transfer is not allowed.");
      return;
    }

    router.push(
      `/send/amount?asset=${asset}&recipient=${encodeURIComponent(
        receiverUid
      )}`
    );
  };

  const assetLogo =
    asset === "USDT"
      ? "/media/tether-usdt-logo.png"
      : "/media/usd-coin-usdc-logo.png";

  return (
    <>
      <main className="min-h-screen bg-[#f6f7f9] px-5 pb-28 pt-6 dark:bg-[#0b0b0d]">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-slate-800 shadow-sm dark:bg-[#18181b] dark:text-white"
            aria-label="Go back"
          >                  
            ←
          </button>

          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Send
          </h1>
        </div>

        {/* Asset */}
        <section className="mt-8">
          <p className="mb-2 px-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Asset
          </p>

          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-[#18181b]">
            <img
              src={assetLogo}
              alt={asset}
              className="h-11 w-11 rounded-full object-contain"
            />

            <div>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                {asset}
              </p>

            </div>
          </div>
        </section>

        {/* Recipient */}
        <section className="mt-8">
          <label
            htmlFor="receiverUid"
            className="mb-2 block px-1 text-sm font-medium text-slate-500 dark:text-slate-400"
          >
            Recipient
          </label>

          <div className="flex items-center rounded-2xl bg-white px-4 shadow-sm dark:bg-[#18181b]">
            <input
              id="receiverUid"
              type="text"
              value={recipientUid}
              onChange={handleUidChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  lookupRecipient(recipientUid);
                }
              }}
              placeholder="Receiver StabiX UID"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent py-4 text-[16px] font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
            />

            {loadingRecipient && (
              <div className="ml-2 h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              lookupRecipient(recipientUid)
            }
            disabled={
              loadingRecipient ||
              !recipientUid.trim()
            }
            className="mt-3 w-full rounded-2xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-40 dark:bg-white dark:text-black"
          >
            {loadingRecipient
              ? "Finding recipient..."
              : "Find Recipient"}
          </button>
        </section>

        {/* Recipient Card */}
        {recipient && (
          <section className="mt-5">
            <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-[#18181b]">
              {recipient.profile_image ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace(
                    /\/$/,
                    ""
                  )}${recipient.profile_image}`}
                  alt="Recipient"
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  {(
                    recipient.username ||
                    "U"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate text-[16px] font-bold text-slate-900 dark:text-white">
                  {recipient.username}
                </p>

                <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
                  {recipient.stbx_uid}
                </p>
              </div>

              <div className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm text-white">
                ✓
              </div>
            </div>
          </section>
        )}

        {/* Next */}
<div className="mt-8 pb-5">
  <button
    type="button"
    onClick={handleNext}
    disabled={!recipient}
    className="w-full rounded-2xl bg-blue-600 py-4 text-[15px] font-bold text-white shadow-lg transition active:scale-[0.98] disabled:opacity-40"
  >
    Next
  </button>
</div>
      </main>

      <AppPopup
        open={popupOpen}
        message={popupMessage}
        onClose={() => setPopupOpen(false)}
      />
    </>
  );
}