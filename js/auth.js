
window.googleLogin = async () => {

  window.initializeGoogleLogin(async (response) => {

    try {

      const apiResponse = await fetch(
        "http://localhost:3000/api/users/google-login",
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

      localStorage.setItem("stbx_uid", data.user.stbx_uid);
      localStorage.setItem("stbx_google_uid", data.user.google_uid);

      location.reload();

    } catch (e) {
      console.log("Google Login Error:", e);
      alert(e.message);
    }

  });

  google.accounts.id.prompt();

};



window.googleResetLogin = async () => {
  try {

    window.initializeGoogleLogin(async (response) => {

      const id_token = response.credential;

      alert("Reset password migration pending.");

    });

    google.accounts.id.prompt();

  } catch (e) {
    alert(e.message);
  }
};

window.googleLogout = () => {
  localStorage.clear();

  google.accounts.id.disableAutoSelect();

  location.reload();
};


