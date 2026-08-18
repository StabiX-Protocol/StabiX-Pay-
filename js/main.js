import "./Tx/tx.js";
import "./auth.js"
import "./App/home.js";
import "./App/navigation/selecttab.js";
import "./App/send.js";
import "./App/notification.js";
import "./App/qr.js";

import "./App/DW/Mode/selectmode.js"
import "./App/navigation/homenav.js";
import "./App/navigation/deposit.js";
import "./App/navigation/history.js";
import "./App/navigation/setting.js";

import "./App/DW/Mode/Instant Mode/instantdeposit.js";
import "./App/DW/Mode/Instant Mode/instantwithdraw.js";
import "./App/DW/Mode/Adavance Mode/advancedeposit.js";
import "./App/DW/Mode/Adavance Mode/advancedwithdraw.js";

import "./App/DW/dwnav.js";
import "./App/DW/network.js";

import "./App/Validator/Validatorpanel.js";

import "./App/Business/business.js";

window.appDiv = function(h){document.getElementById("app").innerHTML = h;}

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

<div id="googleLoginButton"></div>

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
window.renderGoogleLoginButton();

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

<div id="googleSignupButton"></div>


</div>
</div>
`);

window.renderGoogleSignupButton();
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

 const response = await fetch("http://10.148.199.19:3000/api/users/reset-password", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    stbx_uid: stbxId,
    password
  })
});

const data = await response.json();

if (!response.ok) {
  alert(data.message);
  return;
}

localStorage.removeItem("reset_uid");
localStorage.removeItem("reset_google_token");

alert("Password updated successfully.");

renderSetup();
};


window.saveUsername = async () => {

  const username =
    document.getElementById("uname").value.trim().toLowerCase();

  const password =
    document.getElementById("signupPwd").value.trim();

  const confirm =
    document.getElementById("confirmPwd").value.trim();


  if (!username || !password || !confirm) {
    return alert("Fill all fields");
  }


  if (password.length < 6) {
    return alert("Password must be at least 6 characters");
  }


  if (password !== confirm) {
    return alert("Passwords do not match");
  }


  /* =================================
     GET GOOGLE TOKEN
  ================================= */

  const googleToken =
    localStorage.getItem("pending_google_token");


  if (!googleToken) {
    return alert(
      "Google signup session expired. Please try again."
    );
  }


  console.log(
    "✅ Pending Google token found:",
    googleToken.length
  );


  /* =================================
     REGISTER USER
  ================================= */

  try {

    const response = await fetch(
      "http://10.148.199.19:3000/api/users/register",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

  stbx_uid:
    window.generateSTBX(),

  google_id_token:
    googleToken,

  username:
    username,

  password:
    password

})
      }
    );


    const data =
      await response.json();


    console.log(
      "Google Signup API:",
      response.status,
      data
    );


    if (!response.ok) {

      alert(
        data.message ||
        "Google signup failed."
      );

      return;
    }


    /* =================================
       ACCOUNT CREATED
    ================================= */

    window.WALLET =
      data.user.stbx_uid;


    window.setToken(
      data.token
    );


    localStorage.setItem(
      "stbx_uid",
      data.user.stbx_uid
    );


    if (data.user.google_uid) {

      localStorage.setItem(
        "stbx_google_uid",
        data.user.google_uid
      );

    }


    /* =================================
       REMOVE TEMP GOOGLE TOKEN
    ================================= */

    localStorage.removeItem(
      "pending_google_token"
    );


    console.log(
      "✅ Google account created successfully"
    );


    location.reload();


  } catch (error) {

    console.error(
      "❌ Google Signup Error:",
      error
    );


    alert(
      "Google signup failed. Please try again."
    );

  }

};

async function manualLogin() {

  const stbxId = document.getElementById("loginStbx").value.trim();
  const password = document.getElementById("loginPwd").value.trim();

  if (!stbxId || !password) {
    return alert("Fill all fields");
  }

  const response = await fetch("http://10.148.199.19:3000/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      stbx_uid: stbxId,
      password
    })
  });

  const data = await response.json();

  if (!response.ok) {
return alert(data.message);
}

window.WALLET = data.user.stbx_uid;

window.setToken(data.token);
localStorage.setItem("stbx_uid", data.user.stbx_uid);

if (data.user.google_uid) {
  localStorage.setItem("stbx_google_uid", data.user.google_uid);
}

localStorage.removeItem("pending_google_token");

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

<div id="googleResetButton"></div>
</div>

</div>
`);
window.renderGoogleResetButton();
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


 window.WALLET = window.getCurrentUserId();
const stbxUID = window.WALLET;
/* ================= INIT ================= */
async function init() {
if (!stbxUID) {
renderSetup();
return;
}
renderApp();
}
init();
