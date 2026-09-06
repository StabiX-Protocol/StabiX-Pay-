"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google?: any;
  }
}

export default function CreateAccountPage() {
  const router = useRouter();
  const googleRef = useRef<HTMLDivElement>(null);

  const [googleReady, setGoogleReady] = useState(false);
  const [googleToken, setGoogleToken] = useState("");

  const [showSignupForm, setShowSignupForm] = useState(false);
  const [showExistingModal, setShowExistingModal] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  /*
   * ==========================================
   * GOOGLE SCRIPT READY
   * ==========================================
   */

  useEffect(() => {
    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        setGoogleReady(true);
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  /*
   * ==========================================
   * RENDER GOOGLE BUTTON
   * ==========================================
   */

  useEffect(() => {
    if (!googleReady) {
      return;
    }

    if (!googleRef.current) {
      return;
    }

    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error(
        "❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID missing"
      );
      return;
    }

    if (
      !window.google?.accounts?.id
    ) {
      console.error(
        "❌ Google Identity Services not ready"
      );
      return;
    }

    googleRef.current.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredential,
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

    console.log(
      "✅ Google Create Account button rendered"
    );
  }, [googleReady]);

  /*
   * ==========================================
   * GOOGLE CALLBACK
   * ==========================================
   */

  async function handleGoogleCredential(
    response: any
  ) {
    console.log(
      "🔥 GOOGLE CREATE ACCOUNT CALLBACK"
    );

    if (!response?.credential) {
      console.error(
        "❌ Google credential missing"
      );

      setMessage(
        "Google authentication failed. Please try again."
      );

      return;
    }

    try {
      setLoading(true);
      setMessage("");

      console.log(
        "✅ Google credential received:",
        response.credential.length
      );

      /*
       * ======================================
       * CHECK WHETHER GOOGLE ACCOUNT EXISTS
       * ======================================
       */

      const apiUrl =
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/login/google`;

      console.log(
        "GOOGLE CREATE CHECK API:",
        apiUrl
      );

      const apiResponse =
        await fetch(apiUrl, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            id_token:
              response.credential,
          }),
        });

      const data =
        await apiResponse
          .json()
          .catch(() => null);

      console.log(
        "GOOGLE CREATE CHECK:",
        apiResponse.status,
        data
      );

      /*
       * ======================================
       * ACCOUNT ALREADY EXISTS
       * ======================================
       */

      if (apiResponse.ok) {
        setShowExistingModal(true);
        return;
      }

      /*
       * ======================================
       * NEW GOOGLE ACCOUNT
       * ======================================
       *
       * Backend says 404
       * → Google account not registered
       * → continue signup
       */

      if (apiResponse.status === 404) {
        setGoogleToken(
          response.credential
        );

        setShowSignupForm(true);

        return;
      }

      /*
       * ======================================
       * OTHER ERROR
       * ======================================
       */

      setMessage(
        data?.message ||
          "Google account verification failed."
      );

    } catch (error) {
      console.error(
        "❌ GOOGLE CREATE ACCOUNT ERROR:",
        error
      );

      setMessage(
        "Unable to connect to StabiX. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ==========================================
   * GENERATE STBX UID
   * ==========================================
   */

  function generateSTBX() {
    const random =
      Math.floor(
        1000000000 +
          Math.random() *
            9000000000
      );

    return `STBX10${random}`;
  }

  /*
   * ==========================================
   * CREATE ACCOUNT
   * ==========================================
   */

  async function handleCreateAccount() {
    const cleanUsername =
      username
        .trim()
        .toLowerCase();

    if (!cleanUsername) {
      setMessage(
        "Please choose a username."
      );
      return;
    }

    if (!password) {
      setMessage(
        "Please enter a password."
      );
      return;
    }

    if (!confirmPassword) {
      setMessage(
        "Please confirm your password."
      );
      return;
    }

    if (password.length < 6) {
      setMessage(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setMessage(
        "Passwords do not match."
      );
      return;
    }

    if (!googleToken) {
      setMessage(
        "Google signup session expired. Please try again."
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const apiUrl =
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/register`;

      console.log(
        "REGISTER API:",
        apiUrl
      );

      const response =
        await fetch(apiUrl, {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            stbx_uid:
              generateSTBX(),

            google_id_token:
              googleToken,

            username:
              cleanUsername,

            password:
              password,
          }),
        });

      const data =
        await response
          .json()
          .catch(() => null);

      console.log(
        "REGISTER RESPONSE:",
        response.status,
        data
      );

      if (!response.ok) {
        setMessage(
          data?.message ||
            "Account registration failed."
        );

        return;
      }

      if (
        !data?.token ||
        !data?.user?.stbx_uid
      ) {
        setMessage(
          "Account created, but login session was not returned."
        );

        return;
      }

      /*
       * ======================================
       * SAVE SESSION
       * ======================================
       */

      localStorage.setItem(
        "jwt_token",
        data.token
      );

      localStorage.setItem(
        "stbx_uid",
        data.user.stbx_uid
      );

      if (
        data.user.google_uid
      ) {
        localStorage.setItem(
          "stbx_google_uid",
          data.user.google_uid
        );
      }

      /*
       * REMOVE TEMP TOKEN
       */

      setGoogleToken("");

      /*
       * OPEN HOME
       */

      router.replace("/");

    } catch (error) {
      console.error(
        "❌ REGISTER FETCH ERROR:",
        error
      );

      setMessage(
        "Unable to connect to StabiX. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ==========================================
   * BACK BUTTON
   * ==========================================
   */

  function handleBack() {
  router.push("/login");
  }

  /*
   * ==========================================
   * PAGE
   * ==========================================
   */

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          console.log(
            "✅ Google GIS script loaded"
          );

          setGoogleReady(true);
        }}
      />

<main className="min-h-screen w-full overflow-x-hidden bg-background px-5 pb-10 text-foreground transition-colors relative">

  {/* BACKGROUND GLOW */}

  <div className="pointer-events-none absolute -top-12 left-1/2 h-[400px] w-[100vw] max-w-[700px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.10),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.16),transparent_65%)]" />

  <div className="mx-auto w-full max-w-[430px] pt-12 relative">

    {/* BACK BUTTON */}

    <button
      type="button"
      onClick={handleBack}
      className="mb-8 flex h-[52px] items-center rounded-[18px] bg-surface px-5 text-[18px] font-semibold text-foreground shadow-sm ring-1 ring-border hover:bg-background active:scale-[0.98] transition-all"
    >
      ←
    </button>

    {!showSignupForm ? (
      <>
        {/* LOGO */}

        <h1 className="text-[56px] sm:text-[64px] font-extrabold leading-none tracking-[-0.06em] text-foreground antialiased">
          StabiX
        </h1>

        {/* TAGLINE */}

        <p className="mt-8 sm:mt-10 text-[24px] sm:text-[28px] font-medium leading-tight tracking-[-0.02em] text-muted">
          Pay Stablecoins Instant, Free & Secure
        </p>

        {/* TITLE */}

        <h2 className="mt-20 sm:mt-28 text-[40px] sm:text-[48px] font-extrabold tracking-[-0.04em] text-foreground antialiased">
          Create Account
        </h2>

        {/* GOOGLE BUTTON */}

        <div className="mt-8 sm:mt-10 flex w-full justify-center">

          <div
            ref={googleRef}
            className="flex min-h-[60px] w-full max-w-[360px] justify-center overflow-hidden rounded-[20px] bg-surface p-1.5 ring-1 ring-border shadow-sm"
          />

        </div>

        {/* DESCRIPTION */}

        <p className="mt-4 text-center text-[16px] sm:text-[18px] text-muted">
          Create your StabiX account with google.
        </p>

        {/* LOADING */}

        {loading && (
          <p className="mt-6 text-center text-[16px] text-muted animate-pulse">
            Checking Google account...
          </p>
        )}

        {/* ERROR */}

        {message && (
          <div className="mt-6 rounded-[20px] bg-red-50 dark:bg-red-950/30 px-5 py-4 text-center text-[16px] font-medium text-red-600 ring-1 ring-red-200 dark:ring-red-900/50">
            {message}
          </div>
        )}
      </>
    ) : (
      <>
        {/* LOGO */}

        <h1 className="text-[56px] sm:text-[64px] font-extrabold leading-none tracking-[-0.06em] text-foreground antialiased">
          StabiX<span className="text-blue-600">.</span>
        </h1>

        {/* TAGLINE */}

        <p className="mt-8 sm:mt-10 text-[24px] sm:text-[28px] font-medium leading-tight tracking-[-0.02em] text-muted">
          Pay Stablecoins Instant, Free & Secure
        </p>

        {/* TITLE */}

        <h2 className="mt-16 sm:mt-20 text-[38px] sm:text-[42px] font-extrabold tracking-[-0.04em] text-foreground">
          Finish Account
        </h2>

        <p className="mt-3 text-[16px] sm:text-[18px] text-muted">
          Choose your username and password.
        </p>

        {/* FORM */}

        <div className="mt-8 sm:mt-10 space-y-3 sm:space-y-4">

          {/* USERNAME */}

          <input
            type="text"
            placeholder="Choose Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="h-[68px] sm:h-[76px] w-full rounded-[24px] sm:rounded-[28px] bg-input px-7 sm:px-9 text-[19px] sm:text-[22px] text-foreground outline-none ring-1 ring-border placeholder:text-muted focus:bg-surface focus:ring-[6px] focus:ring-blue-600/10 focus:translate-y-[-1px] transition-all"
          />

          {/* PASSWORD */}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="h-[68px] sm:h-[76px] w-full rounded-[24px] sm:rounded-[28px] bg-input px-7 sm:px-9 text-[19px] sm:text-[22px] text-foreground outline-none ring-1 ring-border placeholder:text-muted focus:bg-surface focus:ring-[6px] focus:ring-blue-600/10 focus:translate-y-[-1px] transition-all"
          />

          {/* CONFIRM PASSWORD */}

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            className="h-[68px] sm:h-[76px] w-full rounded-[24px] sm:rounded-[28px] bg-input px-7 sm:px-9 text-[19px] sm:text-[22px] text-foreground outline-none ring-1 ring-border placeholder:text-muted focus:bg-surface focus:ring-[6px] focus:ring-blue-600/10 focus:translate-y-[-1px] transition-all"
          />

          {/* ERROR */}

          {message && (
            <div className="rounded-[20px] bg-red-50 dark:bg-red-950/30 px-5 py-4 text-center text-[16px] font-medium text-red-600 ring-1 ring-red-200 dark:ring-red-900/50">
              {message}
            </div>
          )}

          {/* CREATE ACCOUNT BUTTON */}

          <button
            type="button"
            onClick={handleCreateAccount}
            disabled={loading}
            className="mt-3 h-[74px] sm:h-[82px] w-full rounded-[26px] sm:rounded-[30px] bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] text-[21px] sm:text-[24px] font-bold text-white shadow-[0_12px_24px_-8px_rgba(37,99,235,0.5)] active:scale-[0.99] disabled:opacity-50 transition-all relative overflow-hidden"
          >

            <span className="relative z-10">
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </span>

            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

          </button>

        </div>
      </>
    )}

  </div>
</main>


{/* EXISTING GOOGLE ACCOUNT MODAL */}

{showExistingModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 px-4 backdrop-blur-sm">

    <div className="w-full max-w-[390px] rounded-[28px] sm:rounded-[30px] bg-surface border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-7 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.35)]">

      {/* GOOGLE ICON */}

      <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/15 text-xl sm:text-2xl font-bold text-blue-600">
        G
      </div>

      {/* TITLE */}

      <h3 className="mt-5 text-[23px] sm:text-[26px] font-extrabold leading-tight tracking-tight text-foreground">
        Google Account Already Registered
      </h3>

      {/* MESSAGE */}

      <p className="mt-3 text-[16px] sm:text-[17px] leading-relaxed text-muted">
        This Google account is already linked to a StabiX account.
      </p>

      <p className="mt-2 text-[16px] sm:text-[17px] leading-relaxed text-muted">
        Please use Login to access your account.
      </p>

      {/* BUTTONS */}

      <div className="mt-7 flex gap-3">

        <button
          type="button"
          onClick={() =>
            setShowExistingModal(false)
          }
          className="h-[56px] sm:h-[58px] flex-1 rounded-[18px] sm:rounded-[20px] bg-background text-[16px] sm:text-[17px] font-bold text-foreground ring-1 ring-border hover:bg-input active:scale-[0.98] transition-all"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() =>
            router.push("/login")
          }
          className="h-[56px] sm:h-[58px] flex-1 rounded-[18px] sm:rounded-[20px] bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] text-[16px] sm:text-[17px] font-bold text-white shadow-[0_8px_16px_-6px_rgba(37,99,235,0.5)] active:scale-[0.98] transition-all"
        >
          Try Login
        </button>

      </div>

    </div>

  </div>
)}
    </>
  );
}