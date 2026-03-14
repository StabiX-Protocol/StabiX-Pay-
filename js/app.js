/* ================= TELEGRAM ================= */
const tg = window.Telegram.WebApp;
tg.ready(); tg.expand();
const tgUser = tg.initDataUnsafe?.user;
if(!tgUser?.id){ document.getElementById("app").innerHTML="Telegram user not found"; throw ""; }

/* ================= IDENTITY ================= */
const WALLET = "TG_" + tgUser.id;
const userRef = doc(db,"users",WALLET);
const validatorRef = doc(db,"validators",String(tgUser.id));

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
      <input id="pwd" type="password" placeholder="Password">
      <button onclick="saveProfile()">Create</button>
    </div>
  `);
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
      <input id="pwd" type="password" placeholder="Password">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
        <button style="width:70%" onclick="login()">Login</button>
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

