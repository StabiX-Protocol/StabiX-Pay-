window.getCurrentUserId = function () {
  return localStorage.getItem("stbx_uid");
};

window.setCurrentUserId = function (uid) {
  localStorage.setItem("stbx_uid", uid);
};

window.generateSTBX = function () {
  const random = Math.floor(1000000000 + Math.random() * 9000000000);
  return "STBX" + random.toString();
};

window.GOOGLE_CLIENT_ID =
  "555121729616-a7a7ertm7i6pgfaps0s2mc9l3v6p6fci.apps.googleusercontent.com";

window.initializeGoogleLogin = function (callback) {

  google.accounts.id.initialize({
    client_id: window.GOOGLE_CLIENT_ID,
    callback
  });

};
