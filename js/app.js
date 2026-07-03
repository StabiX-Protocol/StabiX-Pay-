import "./firebase.js"
import "./wallet.js"
import "./tx.js"
window.appDiv = function(h){document.getElementById("app").innerHTML = h;}
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const googleUID = localStorage.getItem("stbx_google_uid");

if (!googleUID) {
  renderSetup();
  throw "";
}

window.WALLET = googleUID;
window.userRef = doc(db, "users", WALLET);
window.validatorRef = doc(db,"validators",WALLET);
/* ================= INIT ================= */
async function init(){
  const snap = await getDoc(userRef);

  if(!snap.exists()){
    renderSetup();
    return;
  }

  renderApp();
}
/* ================= SETUP ================= */
function renderSetup(){
appDiv(`
<div class="box">
<h3>Welcome to StabiX</h3>
<button onclick="googleLogin()">Continue with Google</button>
</div>
`);
selectTab("home");
}


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
