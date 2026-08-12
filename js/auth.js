
window.GOOGLE_CLIENT_ID =
  "555121729616-a7a7ertm7i6pgfaps0s2mc9l3v6p6fci.apps.googleusercontent.com";



window.initializeGoogleLogin = function (callback) {

  if (!window.google || !google.accounts || !google.accounts.id) {
    console.error("Google Identity Services not loaded");
    alert("Google login is unavailable. Please try again.");
    return;
  }

  google.accounts.id.initialize({
    client_id: window.GOOGLE_CLIENT_ID,
    callback: callback,
    use_fedcm_for_prompt: false
  });

};




window.googleLogin = async () => {

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
        data.message ||
        "Google login failed."
      );

    } catch (e) {

      console.error(
        "Google Login Error:",
        e
      );

      alert(
        "Google login failed. Please try again."
      );
    }

  });

};




window.googleSignup = async () => {

  window.initializeGoogleLogin(async (response) => {

    try {

      if (!response || !response.credential) {
        alert("Google authentication failed.");
        return;
      }

     

      localStorage.setItem(
        "pending_google_token",
        response.credential
      );

      renderUsernameSetup();

    } catch (e) {

      console.error(
        "Google Signup Error:",
        e
      );

      alert(
        "Google signup failed."
      );
    }

  });

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