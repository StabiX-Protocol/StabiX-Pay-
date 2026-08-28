"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const googleRef = useRef<HTMLDivElement>(null);

  const [stbxUid, setStbxUid] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        setGoogleReady(true);
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!googleReady || !googleRef.current) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing");
      return;
    }

    googleRef.current.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleLogin,
      auto_select: false,
      use_fedcm_for_prompt: false,
    });

    window.google.accounts.id.renderButton(googleRef.current, {
      theme: "outline",
      size: "large",
      width: 360,
      text: "continue_with",
    });
  }, [googleReady]);

  async function handleLogin() {
  if (!stbxUid.trim() || !password) {
    alert("Please enter STBX UID and password.");
    return;
  }

  try {
    setLoading(true);

    const apiUrl =
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/login`;

    console.log("LOGIN API:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stbx_uid: stbxUid.trim(),
        password,
      }),
    });

    const data = await response.json().catch(() => null);

    console.log("LOGIN STATUS:", response.status);
    console.log("LOGIN RESPONSE:", data);

    if (!response.ok) {
      alert(
        data?.message ||
        "Login failed. Please check your STBX UID and password."
      );
      return;
    }

    if (!data?.token) {
      alert("Login successful response did not contain a token.");
      return;
    }

    // OLD auth.js compatible storage
    localStorage.setItem("jwt_token", data.token);

    if (data.user?.stbx_uid) {
      localStorage.setItem("stbx_uid", data.user.stbx_uid);
    }

    if (data.user?.google_uid) {
      localStorage.setItem(
        "stbx_google_uid",
        data.user.google_uid
      );
    }

    router.replace("/");
  } catch (error) {
    console.error("❌ LOGIN FETCH ERROR:", error);

    alert(
      "Unable to connect to StabiX.\n\n" +
      "Check that the backend is running and reachable."
    );
  } finally {
    setLoading(false);
  }
}

  async function handleGoogleLogin(response: any) {
    try {
      setLoading(true);

      const data = await apiFetch("/api/users/login/google", {
        method: "POST",
        body: JSON.stringify({
          id_token: response.credential,
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
          : "Google login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-5 pb-10 text-[#111827]">
      <div className="mx-auto max-w-[430px] pt-12">
        <h1 className="text-[64px] font-extrabold leading-none tracking-[-0.06em]">
          StabiX
        </h1>

        <p className="mt-10 text-[28px] leading-tight text-slate-500">
          Pay Stablecoins Instant, Free & Secure
        </p>

        <h2 className="mt-28 text-[48px] font-extrabold">
          Log in
        </h2>

        <div className="mt-12 space-y-4">
          <input
            type="text"
            placeholder="STBX UID"
            value={stbxUid}
            onChange={(e) => setStbxUid(e.target.value)}
            className="h-[76px] w-full rounded-[28px] bg-[#eaf1ff] px-9 text-[22px] outline-none ring-1 ring-slate-200"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-[76px] w-full rounded-[28px] bg-[#eaf1ff] px-9 text-[22px] outline-none ring-1 ring-slate-200"
          />

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="mt-3 h-[82px] w-full rounded-[30px] bg-blue-600 text-[24px] font-bold text-white disabled:opacity-50"
          >
            {loading ? "Please wait..." : "Log In"}
          </button>
        </div>

        <div className="my-8 flex items-center gap-5 text-lg text-slate-500">
          <div className="h-px flex-1 bg-slate-200" />
          <span>or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div
          ref={googleRef}
          className="flex justify-center"
        />

        <div className="mt-10 flex justify-between px-2 text-[19px] font-semibold">
          <Link href="/create-account" className="text-blue-600">
            Create Account
          </Link>

          <Link href="/forgot-password" className="text-blue-600">
            Forgot Password?
          </Link>
        </div>
      </div>
    </main>
  );
}