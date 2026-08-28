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

export default function CreateAccountPage() {
  const router = useRouter();
  const googleRef = useRef<HTMLDivElement>(null);

  const [googleToken, setGoogleToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setup, setSetup] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(timer);

        const clientId =
          process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

        if (!clientId || !googleRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleSignup,
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

  async function handleGoogleSignup(response: any) {
    try {
      setLoading(true);

      const data = await apiFetch("/api/users/login/google", {
        method: "POST",
        body: JSON.stringify({
          id_token: response.credential,
        }),
      });

      // 200 = Google account already registered
      if (data?.token) {
        alert("This Google account is already registered. Please log in.");
        router.replace("/login");
        return;
      }
    } catch (error: any) {
      // Backend intentionally returns 404 for new Google account
      if (
        error instanceof Error &&
        error.message.includes("No StabiX account")
      ) {
        setGoogleToken(response.credential);
        setSetup(true);
        return;
      }

      alert(
        error instanceof Error
          ? error.message
          : "Google verification failed"
      );
    } finally {
      setLoading(false);
    }
  }

  async function createAccount() {
    if (!username.trim() || !password || !confirmPassword) {
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
      setLoading(true);

      const stbxUid =
        "STBX" +
        crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();

      const data = await apiFetch("/api/users/register", {
        method: "POST",
        body: JSON.stringify({
          stbx_uid: stbxUid,
          google_id_token: googleToken,
          username: username.trim().toLowerCase(),
          password,
        }),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("stbx_uid", data.user.stbx_uid);

      if (data.user.google_uid) {
        localStorage.setItem(
          "stbx_google_uid",
          data.user.google_uid
        );
      }

      router.replace("/");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Account creation failed"
      );
    } finally {
      setLoading(false);
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
          {setup ? "Set up account" : "Create Account"}
        </h2>

        {!setup ? (
          <>
            <div
              ref={googleRef}
              className="mt-14 flex justify-center"
            />

            {loading && (
              <p className="mt-5 text-center text-slate-500">
                Checking Google account...
              </p>
            )}
          </>
        ) : (
          <div className="mt-10 space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-[70px] w-full rounded-[25px] bg-white px-7 text-lg ring-1 ring-slate-200 outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[70px] w-full rounded-[25px] bg-white px-7 text-lg ring-1 ring-slate-200 outline-none"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              className="h-[70px] w-full rounded-[25px] bg-white px-7 text-lg ring-1 ring-slate-200 outline-none"
            />

            <button
              onClick={createAccount}
              disabled={loading}
              className="h-[78px] w-full rounded-[28px] bg-blue-600 text-xl font-bold text-white disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}