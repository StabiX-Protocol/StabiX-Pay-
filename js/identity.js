window.getCurrentUserId = function () {
  return localStorage.getItem("stbx_uid");
};

window.setCurrentUserId = function (uid) {
  localStorage.setItem("stbx_uid", uid);
};

window.setToken = function (token) {
  localStorage.setItem("jwt_token", token);
};

window.getToken = function () {
  return localStorage.getItem("jwt_token");
};

window.clearSession = function () {
  localStorage.removeItem("jwt_token");
  localStorage.removeItem("stbx_uid");
};

window.generateSTBX = function () {
  const random = Math.floor(
    1000000000 + Math.random() * 9000000000
  );

  return "STBX" + random.toString();
};

window.GOOGLE_CLIENT_ID =
  "555121729616-a7a7ertm7i6pgfaps0s2mc9l3v6p6fci.apps.googleusercontent.com";

window.initializeGoogleLogin = function (callback) {

  if (
    !window.google ||
    !window.google.accounts ||
    !window.google.accounts.id
  ) {
    console.error("Google Identity Services not loaded");
    alert("Google login is unavailable. Please try again.");
    return;
  }

  google.accounts.id.initialize({
    client_id: window.GOOGLE_CLIENT_ID,
    callback: callback,
    use_fedcm_for_prompt: false
  });

  google.accounts.id.prompt();
};
