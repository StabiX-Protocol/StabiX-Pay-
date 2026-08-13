
window.GOOGLE_CLIENT_ID =
  "555121729616-a7a7ertm7i6pgfaps0s2mc9l3v6p6fci.apps.googleusercontent.com";

window.initializeGoogleLogin = function (callback) {

  if (
    !window.google ||
    !google.accounts ||
    !google.accounts.id
  ) {
    console.error("Google Identity Services not loaded");
    alert("Google login is unavailable.");
    return false;
  }

  google.accounts.id.initialize({
    client_id: window.GOOGLE_CLIENT_ID,
    callback: callback,
    auto_select: false
  });

  return true;
};



window.googleLogin = function () {

  console.log("=== GOOGLE LOGIN START ===");

  window.initializeGoogleLogin(async (response) => {

    console.log("Google callback received:", response);

    try {

      if (!response || !response.credential) {
        console.error("No Google credential received");
        alert("Google authentication failed.");
        return;
      }

      console.log("Google ID token received");

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

      console.log("Google API status:", apiResponse.status);
      console.log("Google API response:", data);

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

        renderUsernameSetup();
        return;
      }

      alert(
        data.message || "Google login failed."
      );

    } catch (e) {

      console.error("Google Login Error:", e);
      alert("Google login failed. Check console.");

    }

  });

  console.log("Calling Google prompt...");

  google.accounts.id.prompt((notification) => {

    console.log("Google prompt notification:", notification);

    if (notification.isNotDisplayed()) {
      console.error(
        "Google prompt NOT displayed:",
        notification.getNotDisplayedReason()
      );
    }

    if (notification.isSkippedMoment()) {
      console.warn(
        "Google prompt skipped:",
        notification.getSkippedReason()
      );
    }

    if (notification.isDismissedMoment()) {
      console.warn(
        "Google prompt dismissed:",
        notification.getDismissedReason()
      );
    }

  });

};


window.googleSignup = async () => {

  const initialized = window.initializeGoogleLogin((response) => {

    if (!response || !response.credential) {
      alert("Google authentication failed.");
      return;
    }

    localStorage.setItem(
      "pending_google_token",
      response.credential
    );

    renderUsernameSetup();
  });

  if (!initialized) return;

  google.accounts.id.prompt();
};


window.googleResetLogin = async () => {

  try {

    window.initializeGoogleLogin(async (response) => {

      try {

        if (!response || !response.credential) {
          alert("Google authentication failed.");
          return;
        }

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


        renderResetPassword();

      } catch (e) {

        console.error(
          "Google Reset Error:",
          e
        );

        alert(
          "Google verification failed."
        );
      }

    });

  } catch (e) {

    console.error(
      "Google Reset Error:",
      e
    );

    alert(
      "Google verification failed."
    );
  }

};




window.googleLogout = () => {

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


  if (
    window.google &&
    google.accounts &&
    google.accounts.id
  ) {
    google.accounts.id.disableAutoSelect();
  }

  location.reload();
};
