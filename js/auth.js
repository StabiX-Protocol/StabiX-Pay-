window.googleLogin = async () => {
  window.initializeGoogleLogin(async (response) => {

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

      if (apiResponse.ok) {

        window.setToken(data.token);
        localStorage.setItem("stbx_uid", data.user.stbx_uid);
        localStorage.setItem("stbx_google_uid", data.user.google_uid);

        location.reload();
        return;
      }

      if (apiResponse.status === 404) {

        localStorage.setItem("pending_google_token", response.credential);

        renderUsernameSetup();
        return;
      }

      alert(data.message || "Google login failed.");

    } catch (e) {

      console.log("Google Login Error:", e);
      alert(e.message);

    }

  });

  google.accounts.id.prompt();

};

window.googleSignup = async () => {

  window.initializeGoogleLogin(async (response) => {

    try {

      localStorage.setItem("pending_google_token", response.credential);

      renderUsernameSetup();

    } catch (e) {

      console.log("Google Signup Error:", e);
      alert(e.message);

    }

  });

  google.accounts.id.prompt();

};

window.googleResetLogin = async () => {

  try {

    window.initializeGoogleLogin(async (response) => {

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

        if (!apiResponse.ok) {
          alert(data.message || "No StabiX account found with this Google account.");
          return;
        }

        localStorage.setItem("reset_uid", data.user.stbx_uid);

        renderResetPassword();

      } catch (e) {

        console.log("Google Reset Error:", e);
        alert("Google verification failed");

      }

    });

    google.accounts.id.prompt();

  } catch (e) {

    console.log(e);
    alert(e.message);

  }

};


window.googleLogout = () => {

  window.clearSession();
  localStorage.removeItem("stbx_google_uid");

  google.accounts.id.disableAutoSelect();

  location.reload();

};