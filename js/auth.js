import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const auth = getAuth(window.appFB);
const provider = new GoogleAuthProvider();

window.googleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

// check existing user by googleUID
const q = query(
  collection(db, "users"),
  where("googleUID", "==", user.uid)
);

const snap = await getDocs(q);

if (!snap.empty) {
  const existingUser = snap.docs[0];

  localStorage.setItem("stbx_uid", existingUser.id);
  localStorage.setItem("stbx_google_uid", user.uid);

  location.reload();
  return;
}

localStorage.setItem("stbx_google_uid", user.uid);
renderUsernameSetup();
return;
    
  } catch (e) {
    console.log("Google Login Error:", e);
    alert(e.message);
  }
};

window.googleResetLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const q = query(
      collection(db, "users"),
      where("googleUID", "==", user.uid)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      alert("No account found with this Google account.");
      return;
    }

    localStorage.setItem("reset_uid", snap.docs[0].id);

    renderResetPassword();

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
