import "./firebase.js"
import "./wallet.js"
import "./tx.js"
import "./auth.js"
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
        <p>Pay Stablecoins Instant Without Gas</p>
      </div>

      <div class="auth-box">
        <h2>Log in</h2>

        <input id="loginStbx" placeholder="StabiX ID" />
        <input id="loginPwd" type="password" placeholder="Password" />

        <button onclick="manualLogin()">Log In</button>

        <div class="divider">or</div>

        <button class="google-btn" onclick="googleLogin()">
          Continue with Google
        </button>

        <div class="auth-links">
  <span class="auth-link" onclick="event.preventDefault(); renderSignup(); return false;">
    Create Account
  </span>

  <span class="auth-link" onclick="event.preventDefault(); forgotPassword(); return false;">
    Forgot Password?
  </span>
</div>
      </div>

    </div>
  `);

  selectTab("home");
}

function renderSignup(){
  appDiv(`
    <div class="auth-page">

      <div class="auth-close" onclick="renderSetup()">✕</div>

      <div class="auth-logo">
        <h1>StabiX</h1>
        <p>Stablecoins, Simplified.</p>
      </div>

      <div class="auth-box">
        <h2>Create Account</h2>

        <input id="uname" placeholder="Username" />
        <input id="signupPwd" type="password" placeholder="Password" />
        <input id="confirmPwd" type="password" placeholder="Confirm Password" />

        <button onclick="saveUsername()">Create Account</button>

        <div class="divider">or</div>

        <button class="google-btn" onclick="googleLogin()">
          Continue with Google
        </button>

        <div class="auth-links">
          <span onclick="renderSetup()">Already have an account?</span>
        </div>
      </div>

    </div>
  `);
}
window.renderSignup = renderSignup;

function renderUsernameSetup(){
  appDiv(`
    <div class="box">
      <h3>Create Username</h3>
      <input id="uname" placeholder="Choose username">
      <button onclick="saveUsername()">Create Account</button>
    `);
}

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

window.forgotPassword = function () {
  alert("Reset flow coming soon");
};

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
