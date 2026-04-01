import "./firebase.js"
import "./wallet.js"
import "./tx.js"
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
/* ================= TELEGRAM ================= */
const tg = window.Telegram.WebApp;
tg.ready(); tg.expand();
const tgUser = tg.initDataUnsafe?.user;
if(!tgUser?.id){ document.getElementById("app").innerHTML="Telegram user not found"; throw ""; }

/* ================= IDENTITY ================= */
window.WALLET = "TG_" + tgUser.id;
window.userRef = doc(db,"users",WALLET);
window.validatorRef = doc(db,"validators",String(tgUser.id));
/* ================= INIT ================= */
async function init(){
  const snap = await getDoc(userRef);
  if(!snap.exists() || !snap.data()?.password){
    renderSetup(); return;
  }
  renderLogin();
}
/* ================= SETUP ================= */
function renderSetup(){
  appDiv(`
    <div class="box">
      <h3>Create Account</h3>
      <input id="uname" placeholder="Username">
      <input id="pwd" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="Password">
      <button onclick="saveProfile()">Create</button>
    </div>
  `);
  selectTab("home");
}
window.saveProfile = async ()=>{
  if(!uname.value.trim() || !pwd.value.trim()) return alert("Fill all fields");
  await setDoc(userRef,{
    username: uname.value.trim(),
    password: pwd.value.trim(),
    walletAddress: WALLET,
    eoaAddress: "",
    balance: 0,
    pendingRequest:false,
    lastUsernameChange: serverTimestamp(),
    createdAt: serverTimestamp()
  });
  renderApp();
};
/* ================= LOGIN ================= */
function renderLogin(){
  appDiv(`
    <div class="box">
      <h3>Login</h3>
      <input id="pwd" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="Password">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
        <button style="width:70%" onclick="window.login()">Login</button>
        <span style="font-size:12px;color:#60a5fa;cursor:pointer" onclick="forgotPassword()">Forgot?</span>
      </div>
    </div>
  `);
}

window.login = async ()=>{
  const snap = await getDoc(userRef);
  if(snap.data().password !== pwd.value.trim()) return alert("Wrong password");
  renderApp();
};
/* ================= FORGOT PASSWORD ================= */
window.forgotPassword = async ()=>{
  const otp = Math.floor(100000 + Math.random()*900000).toString();
  await updateDoc(userRef,{ otp });
  tg.showPopup({ title:"OTP", message:"Your OTP: "+otp, buttons:[{type:"ok"}] });
  renderOTP();
};

function renderOTP(){
  appDiv(`
    <div class="box">
      <h3>Reset Password</h3>
      <input id="otp" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="OTP">
      <input id="npwd" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="New Password">
      <button onclick="verifyOTP()">Reset</button>
      <span style="font-size:12px;color:#60a5fa;cursor:pointer" onclick="forgotPassword()">Resend</span>
    </div>
  `);
}

window.verifyOTP = async ()=>{
  const snap = await getDoc(userRef);
  if(snap.data().otp !== otp.value.trim()) return alert("Invalid OTP");
  await updateDoc(userRef,{ password: npwd.value.trim(), otp:"" });
  renderLogin();
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
window.appDiv = function(h){document.getElementById("app").innerHTML = h;}

init();
