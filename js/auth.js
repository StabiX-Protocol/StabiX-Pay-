window.GOOGLE_CLIENT_ID =
  "555121729616-a7a7ertm7i6pgfaps0s2mc9l3v6p6fci.apps.googleusercontent.com";

let googleInitialized = false;
let googleAuthMode = null;


/* =========================================
   GOOGLE CALLBACK
========================================= */

async function handleGoogleCredential(response) {

  console.log("🔥 GOOGLE CALLBACK RECEIVED");

  if (!response || !response.credential) {
    console.error("❌ Google credential missing");
    alert("Google authentication failed.");
    return;
  }

  console.log(
    "✅ Google credential received:",
    response.credential.length
  );


  /* =========================
     SIGNUP
  ========================= */

  if (googleAuthMode === "signup") {

    console.log("🟢 GOOGLE SIGNUP");

    localStorage.setItem(
      "pending_google_token",
      response.credential
    );

    window.renderUsernameSetup();

    return;
  }


  /* =========================
     LOGIN
  ========================= */

  if (googleAuthMode === "login") {

    console.log("🟢 GOOGLE LOGIN");

    try {

      const apiResponse = await fetch(
        "http://10.148.199.19:3000/api/users/login/google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id_token: response.credential
          })
        }
      );

      const data = await apiResponse.json();

      console.log(
        "Google Login API:",
        apiResponse.status,
        data
      );


      if (apiResponse.ok) {

        window.setToken(data.token);

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

        location.reload();

        return;
      }


      if (apiResponse.status === 404) {

        localStorage.setItem(
          "pending_google_token",
          response.credential
        );

        window.renderUsernameSetup();

        return;
      }


      alert(
        data.message ||
        "Google login failed."
      );

    } catch (error) {

      console.error(
        "❌ Google Login Error:",
        error
      );

      alert(
        "Google login failed. Please try again."
      );
    }

    return;
  }


  /* =========================
     RESET PASSWORD
  ========================= */

  if (googleAuthMode === "reset") {

    console.log("🟢 GOOGLE PASSWORD RESET");

    try {

      const apiResponse = await fetch(
        "http://10.148.199.19:3000/api/users/login/google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id_token: response.credential
          })
        }
      );

      const data = await apiResponse.json();

      console.log(
        "Google Reset API:",
        apiResponse.status,
        data
      );


      if (!apiResponse.ok) {

        alert(
          data.message ||
          "No StabiX account found with this Google account."
        );

        return;
      }


      localStorage.setItem(
        "reset_uid",
        data.user.stbx_uid
      );

      localStorage.setItem(
        "reset_google_token",
        response.credential
      );

      window.renderResetPassword();

    } catch (error) {

      console.error(
        "❌ Google Reset Error:",
        error
      );

      alert(
        "Google verification failed."
      );
    }

    return;
  }

}


/* =========================================
   GOOGLE INITIALIZATION
========================================= */

window.initializeGoogleLogin = function () {

  if (
    !window.google ||
    !window.google.accounts ||
    !window.google.accounts.id
  ) {

    console.error(
      "❌ Google Identity Services not loaded"
    );

    alert(
      "Google login is unavailable. Please try again."
    );

    return false;
  }


  if (googleInitialized) {

    console.log(
      "✅ Google GIS already initialized"
    );

    return true;
  }


  google.accounts.id.initialize({

    client_id:
      window.GOOGLE_CLIENT_ID,

    callback:
      handleGoogleCredential,

    auto_select:
      false,

    use_fedcm_for_prompt:
      false

  });


  googleInitialized = true;

  console.log(
    "✅ Google GIS initialized"
  );

  return true;
};


/* =========================================
   START GOOGLE AUTH
========================================= */

window.startGoogleAuth = function (mode) {

  console.log(
    "🔥 Starting Google auth:",
    mode
  );

  googleAuthMode = mode;

  const initialized =
    window.initializeGoogleLogin();

  if (!initialized) {
    return;
  }


  console.log(
    "Google mode:",
    googleAuthMode
  );

};


/* =========================================
   OLD BUTTON FUNCTIONS
   KEPT FOR COMPATIBILITY
========================================= */

window.googleLogin = function () {

  window.startGoogleAuth("login");

};


window.googleSignup = function () {

  window.startGoogleAuth("signup");

};


window.googleResetLogin = function () {

  window.startGoogleAuth("reset");

};


/* =========================================
   OFFICIAL GOOGLE BUTTON RENDER
========================================= */

window.renderGoogleLoginButton = function () {

  const container =
    document.getElementById("googleLoginButton");

  if (!container) {
    return;
  }

  if (!window.initializeGoogleLogin()) {
    return;
  }

  googleAuthMode = "login";

  container.innerHTML = "";

  google.accounts.id.renderButton(
    container,
    {
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with"
    }
  );

};


window.renderGoogleSignupButton = function () {

  const container =
    document.getElementById("googleSignupButton");

  if (!container) {
    return;
  }

  if (!window.initializeGoogleLogin()) {
    return;
  }

  googleAuthMode = "signup";

  container.innerHTML = "";

  google.accounts.id.renderButton(
    container,
    {
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with"
    }
  );

};


window.renderGoogleResetButton = function () {

  const container =
    document.getElementById("googleResetButton");

  if (!container) {
    return;
  }

  if (!window.initializeGoogleLogin()) {
    return;
  }

  googleAuthMode = "reset";

  container.innerHTML = "";

  google.accounts.id.renderButton(
    container,
    {
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with"
    }
  );

};


/* =========================================
   LOGOUT
========================================= */

window.googleLogout = function () {

  window.clearSession();

  localStorage.removeItem(
    "stbx_google_uid"
  );

  localStorage.removeItem(
    "pending_google_token"
  );

  localStorage.removeItem(
    "reset_google_token"
  );

  localStorage.removeItem(
    "reset_uid"
  );

  googleAuthMode = null;

  if (
    window.google &&
    google.accounts &&
    google.accounts.id
  ) {

    google.accounts.id.disableAutoSelect();

  }

  location.reload();

};