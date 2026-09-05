"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
  const [showPassword, setShowPassword] = useState(false);

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
    if (!googleReady || !googleRef.current) {
      return;
    }

    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error(
        "NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing"
      );
      return;
    }

    googleRef.current.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleLogin,
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

      if (!response.ok) {
        alert(
          data?.message ||
          "Login failed. Please check your STBX UID and password."
        );
        return;
      }

      if (!data?.token) {
        alert(
          "Login successful response did not contain a token."
        );
        return;
      }

      localStorage.setItem(
        "jwt_token",
        data.token
      );

      if (data.user?.stbx_uid) {
        localStorage.setItem(
          "stbx_uid",
          data.user.stbx_uid
        );
      }

      if (data.user?.google_uid) {
        localStorage.setItem(
          "stbx_google_uid",
          data.user.google_uid
        );
      }

      router.replace("/");
    } catch (error) {
      console.error(
        "LOGIN FETCH ERROR:",
        error
      );

      alert(
        "Unable to connect to StabiX.\n\n" +
        "Check that the backend is running and reachable."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(response: any) {
    console.log(
      "GOOGLE CALLBACK RECEIVED"
    );

    if (!response?.credential) {
      console.error(
        "Google credential missing"
      );

      alert(
        "Google authentication failed."
      );

      return;
    }

    try {
      setLoading(true);

      const apiUrl =
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/login/google`;

      console.log(
        "GOOGLE LOGIN API:",
        apiUrl
      );

      const apiResponse = await fetch(
        apiUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_token: response.credential,
          }),
        }
      );

      const data =
        await apiResponse.json().catch(
          () => null
        );

      console.log(
        "GOOGLE LOGIN STATUS:",
        apiResponse.status
      );

      if (apiResponse.ok) {
        if (!data?.token) {
          alert(
            "Login successful response did not contain a token."
          );

          return;
        }

        localStorage.setItem(
          "jwt_token",
          data.token
        );

        if (data.user?.stbx_uid) {
          localStorage.setItem(
            "stbx_uid",
            data.user.stbx_uid
          );
        }

        if (data.user?.google_uid) {
          localStorage.setItem(
            "stbx_google_uid",
            data.user.google_uid
          );
        }

        router.replace("/");
        return;
      }

      if (apiResponse.status === 404) {
        alert(
          "Google Account Not Registered\n\n" +
          "This Google account is not linked to a StabiX account.\n\n" +
          "Please create a new account to continue."
        );

        return;
      }

      alert(
        data?.message ||
        "Google login failed. Please try again."
      );
    } catch (error) {
      console.error(
        "GOOGLE LOGIN FETCH ERROR:",
        error
      );

      alert(
        "Unable to connect to StabiX.\n\n" +
        "Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
<main className="min-h-screen w-full overflow-x-hidden bg-background px-5 pb-10 text-foreground transition-colors">
  <div className="mx-auto w-full max-w-[430px] pt-12">
    <div className="relative w-full">

      {/* SUBTLE BACKGROUND GLOW */}
      <div className="pointer-events-none absolute -top-12 left-1/2 h-[400px] w-[100vw] max-w-[700px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.10),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.16),transparent_65%)]" />

      {/* LOGO */}
      <h1 className="relative text-[64px] font-extrabold leading-none tracking-[-0.06em] text-foreground antialiased">
        StabiX
      </h1>

      {/* TAGLINE */}
      <p className="relative mt-10 text-[28px] font-medium leading-tight tracking-[-0.02em] text-muted">
        Pay Stablecoins Instant,Free Globally
      </p>

      {/* TITLE */}
      <h2 className="relative mt-14 text-[48px] font-extrabold tracking-[-0.04em] text-foreground antialiased">
        Log in
      </h2>

      {/* FORM */}
      <div className="relative mt-12 space-y-4">

        {/* STBX UID */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="STBX UID"
            value={stbxUid}
            onChange={(e) => setStbxUid(e.target.value)}
            className="h-[76px] w-full rounded-[28px] bg-input px-9 text-[22px] text-foreground outline-none ring-1 ring-border shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-all duration-300 placeholder:text-muted focus:bg-surface focus:ring-[8px] focus:ring-blue-600/10 focus:translate-y-[-1px]"
          />
        </div>

        {/* PASSWORD */}
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-[76px] w-full rounded-[28px] bg-input px-9 pr-[72px] text-[22px] text-foreground outline-none ring-1 ring-border shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-all duration-300 placeholder:text-muted focus:bg-surface focus:ring-[8px] focus:ring-blue-600/10 focus:translate-y-[-1px]"
          />

          {/* PASSWORD TOGGLE */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-[12px] top-1/2 grid h-[48px] w-[48px] -translate-y-1/2 place-items-center rounded-full bg-surface/70 text-muted shadow-sm backdrop-blur-md transition-all hover:bg-surface active:scale-[0.96]"
          >
            {showPassword ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        {/* LOGIN BUTTON */}
        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="relative mt-3 h-[82px] w-full overflow-hidden rounded-[30px] bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] text-[24px] font-bold text-white shadow-[0_12px_24px_-8px_rgba(37,99,235,0.5)] transition-all duration-300 hover:translate-y-[-1px] active:translate-y-0 active:scale-[0.99] disabled:opacity-50"
        >
          <span className="relative z-10">
            {loading ? "Please wait..." : "Log In"}
          </span>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
        </button>

      </div>

      {/* OR */}
      <div className="relative my-8 flex items-center gap-5 text-lg text-muted">
        <div className="h-px flex-1 bg-border" />

        <span className="text-[16px] font-medium tracking-widest">
          or
        </span>

        <div className="h-px flex-1 bg-border" />
      </div>

      {/* GOOGLE */}
      <div
        ref={googleRef}
        className="relative flex w-full justify-center overflow-hidden rounded-[20px] bg-surface p-[6px] shadow-sm ring-1 ring-border"
      />

      {/* LINKS */}
      <div className="relative mt-10 flex justify-between px-2 text-[19px] font-semibold">
        <Link
          href="/create-account"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          Create Account
        </Link>

        <Link
          href="/forgot-password"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          Forgot Password?
        </Link>
      </div>

    </div>
  </div>
</main>
  );
}