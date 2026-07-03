import "./firebase.js"
import "./wallet.js"
import "./tx.js"
import "./auth.js"
window.appDiv = function(h){document.getElementById("app").innerHTML = h;}
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const googleUID = localStorage.getItem("stbx_google_uid");
const stbxUID = getCurrentUserId();

if (!googleUID) {
  renderSetup();
  return;
}

if (!stbxUID) {
  localStorage.clear();
  renderSetup();
  return;
}

window.WALLET = stbxUID;


window.userRef = doc(db,"users", window.WALLET);
window.validatorRef = doc(db,"validators", window.WALLET);
/* ================= INIT ================= */
async function init(){
  const snap = await getDoc(userRef);

  if(!snap.exists()){
  renderUsernameSetup();
  return;
  }

  renderApp();
}
/* ================= SETUP ================= */
function renderSetup(){
  appDiv(`
    <div class="auth-page">

      <div class="auth-close">✕</div>

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
          <span onclick="renderSignup()">Create Account</span>
          <span onclick="forgotPassword()">Forgot Password?</span>
        </div>
      </div>

    </div>
  `);

  selectTab("home");
}

function renderUsernameSetup(){
  appDiv(`
    <div class="box">
      <h3>Create Username</h3>
      <input id="uname" placeholder="Choose username">
      <button onclick="saveUsername()">Create Account</button>
    `);
}

window.saveUsername = async ()=>{
  if(!uname.value.trim()) return alert("Enter username");

  await setDoc(userRef,{
    username: uname.value.trim(),
    stbxId: WALLET,
    walletAddress: WALLET,
    eoaAddress: "",
    balance: 0,
    usdtBalance: 0,
    pendingRequest: false,
    createdAt: serverTimestamp()
  });

  renderApp();
};

window.goHome = function(){
const send = document.getElementById("sendScreen");
const amount = document.getElementById("amountScreen");
const confirm = document.getElementById("confirmScreen");
if(send) send.style.display = "none";
if(amount) amount.style.display = "none";
if(confirm) confirm.style.display = "none";
};
/* ================= UTIL ================= */

init();
