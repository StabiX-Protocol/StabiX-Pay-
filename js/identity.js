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
