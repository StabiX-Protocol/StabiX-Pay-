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

  /*
   * ================================
   * GOOGLE GIS READY CHECK
   * ================================
   */

  useEffect(() => {
    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        setGoogleReady(true);
        clearInterval(timer);
      }
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, []);

  /*
   * ================================
   * GOOGLE BUTTON
   * ================================
   */

  useEffect(() => {
    if (!googleReady) {
      return;
    }

    const container = googleRef.current;

    if (!container) {
      console.error(
        "❌ Google signup button container not found"
      );
      return;
    }

    if (
      !window.google ||
      !window.google.accounts ||
      !window.google.accounts.id
    ) {
      console.error(
        "❌ Google Identity Services not loaded"
      );
      return;
    }

    /*
     * EXACT WORKING CLIENT ID
     */

    window.google.accounts.id.initialize({
      client_id:
        "555121729616-a7a7ertm7i6pgfaps0s2mc9l3v6p6fci.apps.googleusercontent.com",

      callback: handleGoogleCredential,

      auto_select: false,

      use_fedcm_for_prompt: false,
    });

    /*
     * CLEAR OLD BUTTON
     */

    container.innerHTML = "";

    /*
     * RENDER GOOGLE BUTTON
     */

    window.google.accounts.id.renderButton(
      container,
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
   * ================================
   * GOOGLE CALLBACK
   * ================================
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

    console.log(
      "✅ Google credential received:",
      response.credential.length
    );

    try {
      setLoading(true);
      setMessage("");

      /*
       * CHECK WHETHER GOOGLE ACCOUNT
       * ALREADY EXISTS
       */

      const apiUrl =
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/login/google`;

      console.log(
        "GOOGLE SIGNUP CHECK API:",
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
        await apiResponse
          .json()
          .catch(() => null);

      console.log(
        "GOOGLE SIGNUP CHECK:",
        apiResponse.status,
        data
      );

      /*
       * ================================
       * GOOGLE ACCOUNT ALREADY EXISTS
       * ================================
       */

      if (apiResponse.ok) {
        setShowExistingModal(true);
        return;
      }

      /*
       * ================================
       * NEW GOOGLE ACCOUNT
       * ================================
       */

      if (apiResponse.status === 404) {
        setGoogleToken(
          response.credential
        );

        setShowSignupForm(true);

        return;
      }

      /*
       * OTHER API ERROR
       */

      setMessage(
        data?.message ||
        "Google account verification failed."
      );

    } catch (error) {
      console.error(
        "❌ GOOGLE SIGNUP CHECK ERROR:",
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
   * ================================
   * GENERATE STBX UID
   * ================================
   */

  function generateSTBX() {
    const random =
      Math.floor(
        1000000000 +
        Math.random() * 9000000000
      );

    return `STBX10${random}`;
  }

  /*
   * ================================
   * CREATE ACCOUNT
   * ================================
   */

  async function handleCreateAccount() {
    const cleanUsername =
      username.trim().toLowerCase();

    /*
     * USERNAME
     */

    if (!cleanUsername) {
      setMessage(
        "Please choose a username."
      );

      return;
    }

    /*
     * PASSWORD
     */

    if (!password) {
      setMessage(
        "Please enter a password."
      );

      return;
    }

    /*
     * CONFIRM PASSWORD
     */

    if (!confirmPassword) {
      setMessage(
        "Please confirm your password."
      );

      return;
    }

    /*
     * PASSWORD LENGTH
     */

    if (password.length < 6) {
      setMessage(
        "Password must be at least 6 characters."
      );

      return;
    }

    /*
     * PASSWORD MATCH
     */

    if (password !== confirmPassword) {
      setMessage(
        "Passwords do not match."
      );

      return;
    }

    /*
     * GOOGLE TOKEN
     */

    if (!googleToken) {
      setMessage(
        "Google signup session expired. Please try again."
      );

      return;
    }

    try {
      setLoading(true);
      setMessage("");

      /*
       * REGISTER API
       */

      const apiUrl =
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/register`;

      console.log(
        "REGISTER API:",
        apiUrl
      );

      const response = await fetch(
        apiUrl,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            stbx_uid: generateSTBX(),

            google_id_token:
              googleToken,

            username:
              cleanUsername,

            password:
              password,
          }),
        }
      );

      const data =
        await response
          .json()
          .catch(() => null);

      console.log(
        "REGISTER RESPONSE:",
        response.status,
        data
      );

      /*
       * REGISTER FAILED
       */

      if (!response.ok) {
        setMessage(
          data?.message ||
          "Account registration failed."
        );

        return;
      }

      /*
       * CHECK TOKEN
       */

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
       * ================================
       * SAVE LOGIN SESSION
       * ================================
       */

      localStorage.setItem(
        "jwt_token",
        data.token
      );

      localStorage.setItem(
        "stbx_uid",
        data.user.stbx_uid
      );

      if (data.user.google_uid) {
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
       * ================================
       * OPEN HOME
       * ================================
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
   * ================================
   * PAGE
   * ================================
   */

  return (
    <>
      {/* GOOGLE GIS SCRIPT */}

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

      <main className="min-h-screen bg-[#f5f7fb] px-5 pb-10 text-[#111827]">

        <div className="mx-auto max-w-[430px] pt-6">

          {/* BACK BUTTON */}

          <button
            type="button"
            onClick={() => router.back()}
            className="mb-8 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl shadow-sm ring-1 ring-slate-200 active:scale-90"
            aria-label="Go back"
          >
            ←
          </button>

          {/* =========================
              GOOGLE START PAGE
          ========================= */}

          {!showSignupForm ? (
            <>
              <h1 className="text-[64px] font-extrabold leading-none tracking-[-0.06em]">
                StabiX
              </h1>

              <p className="mt-10 text-[28px] leading-tight text-slate-500">
                Pay Stablecoins Instant, Free & Secure
              </p>

              <h2 className="mt-28 text-[42px] font-extrabold">
                Create Account
              </h2>

              {/* GOOGLE BUTTON */}

              <div className="mt-10 flex w-full justify-center">
                <div
                  ref={googleRef}
                  className="w-full max-w-[360px]"
                />
              </div>

              <p className="mt-4 text-center text-[18px] leading-relaxed text-slate-500">
                Create StabiX Account with google
              </p>

              {loading && (
                <p className="mt-6 text-center text-slate-500">
                  Checking Google account...
                </p>
              )}

              {message && (
                <div className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-center text-[16px] font-medium text-red-600">
                  {message}
                </div>
              )}

              
            </>
          ) : (

            /* =========================
               FINISH ACCOUNT
            ========================= */

            <>
              <h1 className="text-[64px] font-extrabold leading-none tracking-[-0.06em]">
                StabiX
              </h1>

              <p className="mt-10 text-[28px] leading-tight text-slate-500">
                Pay Stablecoins Instant, Free & Secure
              </p>

              <h2 className="mt-20 text-[42px] font-extrabold">
                Finish Account
              </h2>

              <p className="mt-4 text-[18px] text-slate-500">
                Choose your username and password.
              </p>

              <div className="mt-10 space-y-4">

                {/* USERNAME */}

                <input
                  type="text"
                  placeholder="Choose Username"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                    )
                  }
                  className="h-[76px] w-full rounded-[28px] bg-[#eaf1ff] px-9 text-[22px] outline-none ring-1 ring-slate-200"
                />

                {/* PASSWORD */}

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  className="h-[76px] w-full rounded-[28px] bg-[#eaf1ff] px-9 text-[22px] outline-none ring-1 ring-slate-200"
                />

                {/* CONFIRM PASSWORD */}

                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  className="h-[76px] w-full rounded-[28px] bg-[#eaf1ff] px-9 text-[22px] outline-none ring-1 ring-slate-200"
                />

                {/* ERROR */}

                {message && (
                  <div className="rounded-2xl bg-red-50 px-5 py-4 text-center text-[16px] font-medium text-red-600">
                    {message}
                  </div>
                )}

                {/* CREATE ACCOUNT */}

                <button
                  type="button"
                  onClick={
                    handleCreateAccount
                  }
                  disabled={loading}
                  className="mt-3 h-[82px] w-full rounded-[30px] bg-blue-600 text-[24px] font-bold text-white disabled:opacity-50"
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Account"}
                </button>

              </div>
            </>
          )}

        </div>
      </main>

      {/* ================================
          EXISTING GOOGLE ACCOUNT MODAL
          ================================ */}

      {showExistingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5 backdrop-blur-sm">

          <div className="w-full max-w-[390px] rounded-[30px] bg-white p-7 shadow-2xl">

            {/* ICON */}

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-blue-600">
              G
            </div>

            {/* TITLE */}

            <h3 className="mt-5 text-[26px] font-extrabold text-slate-900">
              Google Account Already Registered
            </h3>

            {/* MESSAGE */}

            <p className="mt-3 text-[17px] leading-relaxed text-slate-500">
              This Google account is already
              linked to a StabiX account.
            </p>

            <p className="mt-2 text-[17px] leading-relaxed text-slate-500">
              Please use Login to access your
              account.
            </p>

            {/* BUTTONS */}

            <div className="mt-7 flex gap-3">

              {/* CANCEL */}

              <button
                type="button"
                onClick={() =>
                  setShowExistingModal(false)
                }
                className="h-[58px] flex-1 rounded-[20px] bg-slate-100 text-[17px] font-bold text-slate-700"
              >
                Cancel
              </button>

              {/* LOGIN */}

              <button
                type="button"
                onClick={() =>
                  router.push("/login")
                }
                className="h-[58px] flex-1 rounded-[20px] bg-blue-600 text-[17px] font-bold text-white"
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