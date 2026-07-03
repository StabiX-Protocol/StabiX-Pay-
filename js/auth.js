import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const auth = getAuth(window.appFB);
const provider = new GoogleAuthProvider();

window.googleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    localStorage.setItem("stbx_google_uid", user.uid);

    if (!getCurrentUserId()) {
      setCurrentUserId(generateSTBX());
    }

    location.reload();
  } catch (e) {
    alert(e.message);
  }
};

window.googleLogout = async () => {
  await signOut(auth);
  localStorage.clear();
  location.reload();
};

window.onAuthStateChanged = onAuthStateChanged;
window.auth = auth;
