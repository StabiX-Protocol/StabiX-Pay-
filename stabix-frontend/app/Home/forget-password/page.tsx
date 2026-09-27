"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google?: any;
  }
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const googleRef = useRef<HTMLDivElement>(null);

  const [resetUid, setResetUid] = useState("");
  const [reset, setReset] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(timer);

        const clientId =
          process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

        if (!clientId || !googleRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleReset,
          auto_select: false,
          use_fedcm_for_prompt: false,
        });

        window.google.accounts.id.renderButton(
          googleRef.current,
          {
            theme: "outline",
            size: "large",
            width: 360,
            text: "continue_with",
          }
        );
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  async function handleGoogleReset(response: any) {
    try {
      const data = await apiFetch("/api/users/login/google", {
        method: "POST",
        body: JSON.stringify({
          id_token: response.credential,
        }),
      });

      setResetUid(data.user.stbx_uid);
      setReset(true);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Google verification failed"
      );
    }
  }

  async function updatePassword() {
    if (!password || !confirmPassword) {
      alert("Fill all fields");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await apiFetch("/api/users/reset-password", {
        method: "PATCH",
        body: JSON.stringify({
          stbx_uid: resetUid,
          password,
        }),
      });

      alert("Password updated successfully");

      router.replace("/login");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Password reset failed"
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-5 pb-10 text-[#111827]">
      <div className="mx-auto max-w-[430px] pt-12">

        <Link
          href="/login"
          className="flex h-[82px] w-[82px] items-center justify-center rounded-[28px] bg-white text-[42px] shadow-sm ring-1 ring-slate-200"
        >
          ×
        </Link>

        <h1 className="mt-16 text-[64px] font-extrabold leading-none tracking-[-0.06em]">
          StabiX
        </h1>

        <p className="mt-10 text-[28px] leading-tight text-slate-500">
          Pay Stablecoins Instant, Free & Secure
        </p>

        <h2 className="mt-28 text-[46px] font-extrabold">
          {reset ? "New Password" : "Reset Password"}
        </h2>

        {!reset ? (
          <div
            ref={googleRef}
            className="mt-14 flex justify-center"
          />
        ) : (
          <div className="mt-12 space-y-4">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[70px] w-full rounded-[25px] bg-white px-7 text-lg ring-1 ring-slate-200 outline-none"
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              className="h-[70px] w-full rounded-[25px] bg-white px-7 text-lg ring-1 ring-slate-200 outline-none"
            />

            <button
              onClick={updatePassword}
              className="h-[78px] w-full rounded-[28px] bg-blue-600 text-xl font-bold text-white"
            >
              Update Password
            </button>
          </div>
        )}
      </div>
    </main>
  );
}