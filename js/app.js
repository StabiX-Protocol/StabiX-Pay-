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
