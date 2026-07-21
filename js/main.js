import "./firebase.js"
import "./Tx/tx.js";
import "./auth.js"
import "./App/home.js";
import "./App/navigation/selecttab.js";
import "./App/send.js";
import "./App/notification.js";
import "./App/qr.js";

import "./App/navigation/homenav.js";
import "./App/navigation/deposit.js";
import "./App/navigation/history.js";
import "./App/navigation/setting.js";

import "./App/DW/dwnav.js";
import "./App/DW/network.js";

import "./App/Validator/Validatorpanel.js";

import "./App/Business/business.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

window.appDiv = function(h){document.getElementById("app").innerHTML = h;}
const googleUID = localStorage.getItem("stbx_google_uid");
const stbxUID = getCurrentUserId();

window.WALLET = stbxUID || null;

if (window.WALLET) {
  window.userRef = doc(db, "users", window.WALLET);
  window.validatorRef = doc(db, "validators", window.WALLET);
}
/* ================= SETUP ================= */
function renderSetup(){
  appDiv(`
    <div class="auth-page">


      <div class="auth-logo">
        <h1>StabiX</h1>
        <p>Pay Stablecoins Instant, Free & Secure</p>
      </div>

      <div class="auth-box">
        <h2>Log in</h2>

        <input id="loginStbx" placeholder="StabiX ID" />
        <input id="loginPwd" type="password" placeholder="Password" />

        <button onclick="manualLogin()">Log In</button>

        <div class="divider">or</div>

        <button class="google-btn" onclick="googleLogin()">
    <img src="media/google-logo.png" class="google-icon" alt="Google">
    <span>Continue with Google</span>
</button>

        <div class="auth-links">
  <span class="auth-link" onclick="renderSignup();">
    Create Account
  </span>

  <span class="auth-link" onclick="forgotPassword();">
    Forgot Password?
  </span>
</div>
      </div>

    </div>
  `);

  selectTab("home");
  document.getElementById("bottomNav").style.display = "none";
}

function renderSignup(){
  appDiv(`
    <div class="auth-page">

     <div class="auth-close" onclick="renderSetup()">×</div>

      <div class="auth-logo">
        <h1>StabiX</h1>
        <p>Pay Stablecoins Instant, Free & Secure</p>
      </div>

      <div class="auth-box">
        <h2>Create Account</h2>

        <button class="google-btn" onclick="googleLogin()">
    <img src="media/google-logo.png" class="google-icon" alt="Google">
    <span>Continue with Google</span>
</button>

    </div>
  `);
}
window.renderSetup = renderSetup;
window.renderUsernameSetup = renderUsernameSetup;
window.renderSignup = renderSignup;

function renderUsernameSetup(){
  appDiv(`
    <div class="auth-page">

      <div class="auth-close" onclick="renderSignup()">×</div>

      <div class="auth-logo">
        <h1>StabiX</h1>
        <p>Pay Stablecoins Instant, Free & Secure</p>
      </div>

      <div class="auth-box">
        <h2>Sign In</h2>

        <input id="uname" placeholder="Choose Username" />
        <input id="signupPwd" type="password" placeholder="Password" />
        <input id="confirmPwd" type="password" placeholder="Confirm Password" />

        <button onclick="saveUsername()">Create Account</button>
      </div>

    </div>
  `);
}
window.renderUsernameSetup = renderUsernameSetup;

function renderResetPassword() {
  appDiv(`
    <div class="auth-page">

      <div class="auth-close" onclick="renderSetup()">×</div>

      <div class="auth-logo">
        <h1>StabiX</h1>
        <p>Pay Stablecoins Instant, Free & Secure</p>
      </div>

      <div class="auth-box">
        <h2>New Password</h2>

        <input id="newPwd" type="password" placeholder="New Password">
        <input id="confirmNewPwd" type="password" placeholder="Confirm Password">

        <button onclick="updatePassword()">
          Update Password
        </button>
      </div>

    </div>
  `);
}
window.renderResetPassword = renderResetPassword;

window.updatePassword = async () => {
  const password = document.getElementById("newPwd").value.trim();
  const confirm = document.getElementById("confirmNewPwd").value.trim();

  if (!password || !confirm) {
    return alert("Fill all fields");
  }

  if (password.length < 6) {
    return alert("Password must be at least 6 characters");
  }

  if (password !== confirm) {
    return alert("Passwords do not match");
  }

  const stbxId = localStorage.getItem("reset_uid");

  if (!stbxId) {
    return alert("Reset session expired.");
  }

  await updateDoc(doc(db, "users", stbxId), {
    password
  });

  localStorage.removeItem("reset_uid");

  alert("Password updated successfully.");

  renderSetup();
};


window.saveUsername = async () => {
  const username = document.getElementById("uname").value.trim().toLowerCase();
  const password = document.getElementById("signupPwd").value.trim();
  const confirm = document.getElementById("confirmPwd").value.trim();

  if (!username || !password || !confirm) {
    return alert("Fill all fields");
  }

  if (password.length < 6) {
    return alert("Password must be at least 6 digits");
  }

  if (password !== confirm) {
    return alert("Passwords do not match");
  }

  const q = query(
    collection(db, "users"),
    where("username", "==", username)
  );

  const existing = await getDocs(q);

  if (!existing.empty) {
    return alert("Username already taken");
  }

  const newStbxId = generateSTBX();

window.WALLET = newStbxId;
window.userRef = doc(db, "users", newStbxId);
window.validatorRef = doc(db, "validators", newStbxId);

localStorage.setItem("stbx_uid", newStbxId);
  
  await setDoc(userRef, {
    username,
    password,
    stbxId: newStbxId,
    walletAddress: newStbxId,
    googleUID: localStorage.getItem("stbx_google_uid") || "",
    eoaAddress: "",
    balance: 0,
    usdtBalance: 0,
    pendingRequest: false,
    lastUsernameChange: serverTimestamp(),
    createdAt: serverTimestamp()
  });

  renderApp();
};

async function manualLogin() {
  const stbxId = document.getElementById("loginStbx").value.trim();
  const password = document.getElementById("loginPwd").value.trim();

  if (!stbxId || !password) {
    return alert("Fill all fields");
  }

  const loginRef = doc(db, "users", stbxId);
  const snap = await getDoc(loginRef);

  if (!snap.exists()) {
    return alert("Account not found");
  }

  const user = snap.data();

  if (user.password !== password) {
    return alert("Wrong password");
  }

  localStorage.setItem("stbx_uid", stbxId);

  if (user.googleUID) {
    localStorage.setItem("stbx_google_uid", user.googleUID);
  }

  location.reload();
}
window.manualLogin = manualLogin;

function forgotPassword() {
  appDiv(`
    <div class="auth-page">

      <div class="auth-close" onclick="renderSetup()">×</div>

      <div class="auth-logo">
        <h1>StabiX</h1>
        <p>Pay Stablecoins Instant, Free & Secure</p>
      </div>

      <div class="auth-box">
        <h2>Reset Password</h2>

        <button class="google-btn" onclick="googleResetLogin()">
          <img src="media/google-logo.png" class="google-icon" alt="Google">
          <span>Continue with Google</span>
      </div>

    </div>
  `);
}
window.forgotPassword = forgotPassword;

window.goHome = function(){
const send = document.getElementById("sendScreen");
const amount = document.getElementById("amountScreen");
const confirm = document.getElementById("confirmScreen");
if(send) send.style.display = "none";
if(amount) amount.style.display = "none";
if(confirm) confirm.style.display = "none";
};

/* ================= INIT ================= */
async function init() {
  if (!window.WALLET) {
    renderSetup();
    return;
  }

  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    renderSetup();
    return;
  }

  renderApp();
}
init();
