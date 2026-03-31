window.scanDone = false
window.scanTargetId = null
window.isScanFlow = false;
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
/* ================= USERNAME CHANGE (30 DAYS) ================= */
window.changeUsername = async ()=>{
  const snap = await getDoc(userRef);
  const last = snap.data().lastUsernameChange?.toDate();
  if(last && ((Date.now()-last)/(1000*60*60*24)) < 30)
    return alert("Username can be changed once every 30 days");

  const name = prompt("New username");
  if(!name?.trim()) return;
  await updateDoc(userRef,{ username:name.trim(), lastUsernameChange:serverTimestamp() });
  renderApp();
};
/* ================= MAIN APP ================= */
window.renderApp = async function(){
  const user = (await getDoc(userRef)).data();
  const isValidator = (await getDoc(validatorRef)).exists();
  const now = new Date();
const yyyy = now.getFullYear();
const mm = String(now.getMonth() + 1).padStart(2,"0");
const dd = String(now.getDate()).padStart(2,"0");
const today = `${yyyy}-${mm}-${dd}`;
  appDiv(`
    <div class="box">
    <div class="refreshIcon" onclick="softRefresh()">↻</div>
    <div class="walletHeader">

    <div class="notifBell" onclick="openNotifications()">
    <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 3C9.8 3 8 4.8 8 7V9.5C8 10.3 7.7 11 7.2 11.6L6 13.2C5.4 14 5.9 15 6.9 15H17.1C18.1 15 18.6 14 18 13.2L16.8 11.6C16.3 11 16 10.3 16 9.5V7C16 4.8 14.2 3 12 3Z" stroke="white" stroke-width="1.8"/>
    <path d="M10 18C10.3 18.9 11.1 19.5 12 19.5C12.9 19.5 13.7 18.9 14 18" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
    <span id="notifCount" class="notifCount"></span>
    </div>

<div class="userRow" onclick="toggleProfile()">
${user.username}
<span class="arrow">▼</span>
</div>

<div id="profileHidden" class="profileHidden">

<div class="small">
TG ID<br>
${WALLET}
</div>

<div class="small" style="margin-top:10px">
EOA Wallet<br>
${user.eoaAddress ? user.eoaAddress : "Not added"}
</div>

</div>

<div class="balanceBig">
${user.balance.toFixed(2)} USDC
</div>
   
<div class="walletActions">
<div class="walletAction" onclick="openSend()">
<div class="walletActionIcon">
<svg width="28" height="28" viewBox="0 0 24 24" fill="none">
  <path d="M12 19V5M12 5L6 11M12 5L18 11" stroke="white" stroke-width="2" stroke-linecap="round"/>
</svg>
</div>
<div class="walletActionLabel">Send</div>
</div>

<div class="walletAction" onclick="showReceive()">
<div class="walletActionIcon">
<svg width="28" height="28" viewBox="0 0 24 24" fill="none">
  <path d="M12 5V19M12 19L6 13M12 19L18 13" stroke="white" stroke-width="2" stroke-linecap="round"/>
</svg>
</div>
<div class="walletActionLabel">Receive</div>
</div>

<div class="walletAction" onclick="openScanner()">
<div class="walletActionIcon">
<svg viewBox="0 0 24 24" fill="none">

  <path d="M5 9V6.5C5 6.2 5.2 6 5.5 6H8" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M16 6H18.5C18.8 6 19 6.2 19 6.5V9" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M5 15V17.5C5 17.8 5.2 18 5.5 18H8" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M16 18H18.5C18.8 18 19 17.8 19 17.5V15" stroke="white" stroke-width="1.8" stroke-linecap="round"/>

  <rect x="8" y="8" width="2.2" height="2.2" rx="0.5" fill="white"/>
  <rect x="13.8" y="8" width="2.2" height="2.2" rx="0.5" fill="white"/>
  <rect x="8" y="13.8" width="2.2" height="2.2" rx="0.5" fill="white"/>
  <rect x="13.8" y="13.8" width="2.2" height="2.2" rx="0.5" fill="white"/>
</svg>
</div>
<div class="walletActionLabel">Scan</div>
</div>

</div>
</div>


<hr>
      ${user.pendingRequest
  ? `<div class="warn"> Pending request under review</div>`
  : ""
      }

     <div id="receiveScreen" style="display:none">
  <div class="sendHeader">
    <button onclick="closeReceive()" class="backBtn">←</button>
    <h2>Receive USDC</h2>
  </div>
  <div class="sendBody" style="text-align:center">
    <div class="qrWrap"><img id="qrImg"></div>
    <p class="small" style="margin-top:10px">
      Only Send USDC To This QR Code.
    </p>
    <div style="margin-top:20px;font-weight:bold">
    Wallet ID
    </div>
    <div class="addrBox">
  <span id="walletAddr"></span>
  <span onclick="copyWallet()" class="copyIcon">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="#fff" stroke-width="2"/>
      <rect x="2" y="2" width="13" height="13" rx="2" stroke="#fff" stroke-width="2"/>
    </svg>
  </span>
</div>
  </div>
  </div>
      
      <hr>
<h3>Deposit / Withdraw</h3>

<div style="
display:flex;
gap:10px;
margin-top:10px;
">

<button onclick="openDeposit()" style="background:#22c55e;color:#022c22;font-weight:bold">
Deposit
</button>

<button onclick="openWithdraw()" style="background:#ef4444;color:white;font-weight:bold">
Withdraw
</button>

</div>

<div id="depositBox" style="
display:none;
margin-top:10px;
padding:10px;
background:#020617;
border:1px solid #1e293b;
border-radius:12px;
">

<select id="networkSelect" onchange="showVault()">
  <option value="">Select Network</option>
  <option value="sepolia">Ethereum (Sepolia)</option>
</select>

<div id="vaultSection" style="display:none;margin-top:10px">

<div class="small">Vault Address:</div>

<div style="display:flex;align-items:center;gap:8px;width:100%">

<span style="
color:#60a5fa;
font-size:12px;
word-break:break-all;
flex:1;
">
0x710c5D40a97123903b7cB482dBe39EB35D52af0a
</span>

<button onclick="copyVault()" style="
width:auto;
padding:6px 10px;
font-size:12px;
flex-shrink:0;
">
Copy
</button>

</div>

<button onclick="showDepositForm()" style="background:#22c55e;color:#022c22;font-weight:bold">
Submit Deposit Proof 
</button>

<div id="depositForm" style="display:none;margin-top:10px">

<input id="depAmount" type="number" placeholder="Amount">

<input id="depHash" placeholder="Transaction Hash">

<button onclick="submitDeposit()">Submit Deposit</button>

</div>
</div>

</div>
<div id="withdrawBox" style="display:none;margin-top:10px">

<div class="small">Withdraw Address:</div>

<div style="
background:#020617;
border:1px solid #1e293b;
padding:10px;
border-radius:8px;
margin-top:6px;
word-break:break-all;
">

${user.eoaAddress ? user.eoaAddress : "No EOA wallet registered"}

</div>

<input id="wdAmount" type="number" placeholder="Amount">

<button onclick="submitWithdraw()">Request Withdraw</button>

</div>
      <hr>
      <h3>Transaction History</h3>

<input
  id="historyDate"
  type="date"
  value="${today}"
  max="${today}"
  onchange="loadHistoryByDate()"
/>

<div id="history">Loading...</div>

  ${isValidator ? validatorPanel() : ""}
    </div>

  <div id="previewScreen" style="
display:none;
position:fixed;
top:0;
left:0;
width:100vw;
height:100vh;
background:#000;
z-index:9999;
overflow:auto;
">
  <div style="width:100%; max-width:380px; margin:0 auto;">

    <div class="sendHeader">
      <button onclick="closePreview()" class="backBtn">←</button>
      <h2>Send USDC</h2>
    </div>

    <div class="sendBody">
      <h1 class="sendTitle">Receiving address</h1>
      <p class="sendSub">Scanned wallet ID</p>

      <div class="addressBox">
        <input id="previewId" readonly />
      </div>

      <button class="nextBtn" onclick="confirmReceiver()">
        Confirm
      </button>
    </div>

  </div>

</div>
      
  `);
  loadHistoryByDate();
  listenNotifications();
  
  // 🎉 RECEIVE POPUP (one-time)
try{
  const q = query(
    collection(db,"transactions"),
    where("userId","==",WALLET),
    orderBy("createdAt","desc")
  );

  const snap = await getDocs(q);
  if(!snap.empty){
    const docSnap = snap.docs[0];
    const t = docSnap.data();

    // sirf received ke liye
    if(t.type === "received"){
      const key = "rx_" + docSnap.id;

      // ek hi baar popup
      if(!sessionStorage.getItem(key)){
        showTxPopup(`Received ${t.amount} USDC from ${t.counterparty}`);
        sessionStorage.setItem(key,"1");
      }
    }
  }
}catch(e){
  console.log("Receive popup error", e);
}
}

 /*=============UI Interface Of Balance Name ========*/
  window.toggleProfile = ()=>{

const box = document.getElementById("profileHidden")

if(box.style.display === "block"){
box.style.display = "none"
}else{
box.style.display = "block"
}

}
window.showReceive = ()=>{
  const wallet = WALLET
  const qrData = JSON.stringify({
  type: "stabix",
  id: wallet
})

const qr = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodeURIComponent(qrData)
  
  document.getElementById("qrImg").src = qr
  document.getElementById("walletAddr").innerText = wallet
  document.getElementById("receiveScreen").style.display = "flex"
  document.getElementById("sendScreen").style.display = "none"
  document.getElementById("amountScreen").style.display = "none"
  document.getElementById("confirmScreen").style.display = "none"
}
window.closeReceive = ()=>{
  document.getElementById("receiveScreen").style.display = "none"
}
window.copyWallet = ()=>{
  navigator.clipboard.writeText(WALLET)
}

  // Sending UI 
let txLock = false
window.openSend = ()=>{
  const old = document.getElementById("sendPopup")
  if(old) old.remove()
  const input = document.getElementById("sendTo")
  if(input) input.value = ""
  const amt = document.getElementById("sendAmt")
  if(amt) amt.value = ""
  window.isScanFlow = false;
  document.getElementById("sendScreen").style.display="flex"
}

window.closeSend = ()=>{
  document.getElementById("sendScreen").style.display="none"
  window.isScanFlow = false;
}

window.goAmount = async ()=>{
const toWallet = document.getElementById("sendTo").value.trim()
if(!toWallet){
alert("Enter wallet ID")
return
}
 const tgPattern = /^TG_\d{6,}$/
if(!tgPattern.test(toWallet)){
alert("Enter valid TG ID (example: TG_123456789)")
return
}
if(toWallet === WALLET){
    alert("Self transfer not allowed")
    return
  }
  try{
    // 🔥 USER EXIST CHECK (FIRESTORE)
    const snap = await getDoc(doc(db,"users",toWallet))
    if(!snap.exists()){
      alert("User not found")
      return
    }
document.getElementById("sendScreen").style.display="none"
document.getElementById("amountScreen").style.display="flex"
    }catch(e){
    alert("Error checking user")
  }
}

window.handleNext = async () => {
  const amount = Number(document.getElementById("sendAmt").value)
  if(!amount || amount <= 0){
    alert("Enter valid amount")
    return
  }
  const snap = await getDoc(userRef)
  const balance = snap.data().balance || 0
  if(amount > balance){
    alert("Insufficient Balance")
    return
  }
  openConfirm()
}

window.backToAddress = ()=>{
  document.getElementById("amountScreen").style.display = "none";
  if(window.isScanFlow){
    document.getElementById("previewScreen").style.display = "flex";
  }else{
    document.getElementById("sendScreen").style.display = "flex";
  }
};

window.openConfirm = () => {
  const amount = document.getElementById("sendAmt").value;
  let toWallet;
  if (window.isScanFlow) {
    toWallet = window.scannedId;   
  } else {
    toWallet = document.getElementById("sendTo").value.trim(); // normal
  }
  if (!toWallet || !amount || amount <= 0) {
    alert("Enter valid amount");
    return;
  }
  if (!toWallet) {
    alert("Invalid receiver");
    return;
  }
  document.getElementById("amountScreen").style.display = "none";
  document.getElementById("confirmScreen").style.display = "flex";
  document.getElementById("confirmAmount").innerText = "-" + amount + " USDC";
  document.getElementById("confirmTo").innerText = toWallet;
  document.getElementById("confirmFrom").innerText = WALLET;
};

window.backToAmount = ()=>{
document.getElementById("confirmScreen").style.display="none"
document.getElementById("amountScreen").style.display="flex"
}

window.confirmSend = () => {
  if (txLock) return;
  txLock = true;
  let toWallet = "";
  if (window.isScanFlow) {
    toWallet =
      window.scannedId ||
      document.getElementById("previewId")?.value?.trim();
  } else {
    toWallet =
      document.getElementById("sendTo")?.value?.trim();
  }
  const amount = Number(document.getElementById("sendAmt")?.value);
  console.log("FINAL DEBUG:", {
    isScanFlow: window.isScanFlow,
    scannedId: window.scannedId,
    previewId: document.getElementById("previewId")?.value,
    toWallet,
    amount
  });
  if (!toWallet || !amount || amount <= 0) {
    alert("Invalid Input");
    txLock = false;
    return;
  }
  document.getElementById("confirmScreen").style.display = "none";
  sendUSDC();
  setTimeout(() => {
    txLock = false;
  }, 3000);
};

window.closeTxPopup = ()=>{
document.getElementById("txPopup").style.display="none"
document.getElementById("txDoneBtn").style.display="none"
  goHome();
  }

let qrScanner = null
window.openScanner = async ()=>{
  document.getElementById("scannerOverlay").style.display = "block"
  document.getElementById("torchBtn").style.display = "block"
  document.getElementById("galleryBtn").style.display = "block"
  
  qrScanner = new Html5Qrcode("qr-reader")
  await qrScanner.start(
  { facingMode: "environment" },
  {
    fps: 10,
    qrbox: {
      width: 250,
      height: 250
    }
  },
    async (decodedText)=>{
      let data
      try{
        data = JSON.parse(decodedText)
      }catch(e){
        alert("Invalid QR")
        return
      }
      if((data.type || "").toLowerCase() !== "stabix"){
        alert("Invalid QR")
        return
      }
      const targetId = data.id
      try{
        const docSnap = await getDoc(doc(db,"users",targetId))
        if(!docSnap.exists()){
          alert("User not found")
          return
        }
      }catch(e){
        alert("Error checking user")
        return
      }
      // 🔥 STOP SCANNER
      await qrScanner.stop()
      document.getElementById("scannerOverlay").style.display = "none"
      
      document.getElementById("previewId").value = targetId
      window.scannedId = targetId  
      window.isScanFlow = true;
      document.getElementById("previewScreen").style.display = "flex"
      document.getElementById("amountScreen").style.display = "none"
    }
  )
}
window.closeScanner = async () => {
  try {
    if (qrScanner && qrScanner.getState() === 2) {
      await qrScanner.stop();
    }
  } catch (e) {
    console.log("Scanner stop error:", e);
  }
  document.getElementById("scannerOverlay").style.display = "none";
  document.getElementById("galleryBtn").style.display = "none"
  document.getElementById("torchBtn").style.display = "none";
  torchOn = false;
  window.scanDone = false;
};

let torchOn = false;
window.toggleTorch = async () => {
  if (!qrScanner) return;
  try {
    if (qrScanner.getState() !== 2) {
      console.log("Scanner not running");
      return;
    }
    torchOn = !torchOn;
    await qrScanner.applyVideoConstraints({
      advanced: [{ torch: torchOn }]
    });
    console.log("Torch:", torchOn ? "ON" : "OFF");
  } catch (e) {
    console.log("Torch error:", e);
  }
};
window.handleGallery = async function (e) {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const html5Qr = new Html5Qrcode("qr-reader");
    const result = await html5Qr.scanFile(file, false);
    await html5Qr.clear();
    let data;
    try {
      data = JSON.parse(result);
    } catch {
      alert("Invalid QR");
      return;
    }
    if ((data.type || "").toLowerCase() !== "stabix") {
      alert("Invalid QR");
      return;
    }
    const targetId = data.id;
    const docSnap = await getDoc(doc(db, "users", targetId));
    if (!docSnap.exists()) {
      alert("User not found");
      return;
    }
      document.getElementById("scannerOverlay").style.display = "none";
      document.getElementById("previewId").value = targetId
      window.isScanFlow = true;
      document.getElementById("previewScreen").style.display = "flex"
      document.getElementById("amountScreen").style.display = "none"
  } catch (err) {
    console.log("Gallery scan error:", err);
    alert("QR not detected");
  }
  e.target.value = "";
};
window.confirmReceiver = () => {
  const id = document.getElementById("previewId").value;
  if (id === WALLET) {
    alert("Self Transfer Not Allowed");
    return;
  }
  window.scannedId = id;   
  window.isScanFlow = true;
  document.getElementById("sendTo").value = id;
  document.getElementById("previewScreen").style.display = "none";
  document.getElementById("amountScreen").style.display = "flex";
};
window.closePreview = () => {
  document.getElementById("previewScreen").style.display = "none";
  scanDone = false;
};


/* ================= Refresh ================= */
  let refreshCount = 0;
window.softRefresh = async function(){
  if(refreshCount >= 2){
    const el = document.querySelector(".box");
    if(el){
      el.style.opacity = "0.5";
      setTimeout(()=> el.style.opacity = "1", 300);
    }
    console.log("Fake refresh (no DB read)");
    return;
  }
  refreshCount++; 
  try{
    const snap = await getDoc(userRef);

    if(!snap.exists()){
      alert("Session expired");
      return;
    }
    renderApp(); 
  }catch(e){
    alert("Refresh failed");
  }
};
/* ================= Notifications ================= */
window.openNotifications = async () => {
  const q = query(
    collection(db, "notifications"),
    where("to", "==", WALLET)
  );
  const snap = await getDocs(q);
  const docs = snap.docs.sort((a, b) => {
    return b.data().time?.seconds - a.data().time?.seconds;
  });
  let html = `
  <div style="background:#000;min-height:100vh;padding:16px;">
  <div style="background:#000;border-radius:18px;padding:16px;">
    <div style="display:flex;align-items:center;gap:10px;">
      <span onclick="renderApp()" style="font-size:20px;cursor:pointer;">←</span>
      <span style="font-size:18px;font-weight:bold;">Notifications</span>
    </div>
  `;
  if(snap.empty){
    html += `<div style="opacity:.6;margin-top:10px">No notifications</div>`;
  }
  let lastDate = "";
  docs.forEach(docSnap => {
    const d = docSnap.data();
    if(d.type !== "validator") return;
    const currentDate = formatDateGroup(d.time);
    if(currentDate !== lastDate){
      html += `
      <div style="margin-top:20px;font-size:16px;font-weight:bold;opacity:.8">
        ${currentDate}
      </div>
      `;
      lastDate = currentDate;
    }
    html += `
    <div style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
      <div style="font-weight:bold">
        ${d.title || "Notification"}
      </div>
      <div style="font-size:12px;opacity:.7">
        ${d.body || ""}
      </div>
    </div>
    `;
  });
  html += `</div>`;
  appDiv(html);
  snap.forEach(async (docSnap) => {
    await updateDoc(doc(db, "notifications", docSnap.id), {
      read: true
    });
  });
};

window.listenNotifications = function(){
  const q = query(
    collection(db, "notifications"),
    where("to", "==", WALLET),
    where("read", "==", false),
    where("type", "==", "validator")
  );
  onSnapshot(q, (snap) => {
    const count = snap.size;
    updateNotif(count);
  });
};

function updateNotif(count){
  const el = document.getElementById("notifCount");
  if(!el) return;
  if(count === 0){
    el.style.display = "none"; 
  } else {
    el.style.display = "flex";
    el.innerText = count; 
  }
}
window.closeNotifications = () => {
  document.getElementById("notifScreen").style.display = "none";
  renderApp();
};

function formatTime(ts){
  if(!ts) return "";
  const date = new Date(ts.seconds * 1000);
  return date.toLocaleString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}
function formatDate(ts){
  if(!ts) return "";
  const date = new Date(ts.seconds * 1000);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short"
  });
}
function formatDateGroup(ts){
  if(!ts) return "";
  const date = new Date(ts.seconds * 1000);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}
window.openNotifDetail = async (id) => {
  const docRef = doc(db, "notifications", id);
  const snap = await getDoc(docRef);
  if(!snap.exists()) return;
  const d = snap.data();
  let html = `
  <div class="box">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:15px">
      <span onclick="openNotifications()" style="font-size:20px;cursor:pointer">←</span>
      <span style="font-weight:bold;font-size:18px">
        ${d.title || "Notification"}
      </span>
    </div>
    <div style="margin-top:10px;font-size:14px;line-height:1.5">
      ${d.body || "No details"}
    </div>
    <div style="margin-top:15px;font-size:12px;opacity:.7">
      ${formatDate(d.time)} • ${formatTime(d.time)}
    </div>
  </div>
  `;
  appDiv(html);
};
window.sendValidatorNotification = async () => {
  const title = document.getElementById("vTitle").value.trim();
  const body = document.getElementById("vBody").value.trim();
  if(!title || !body){
    alert("Enter title & message");
    return;
  }
  try{
    const usersSnap = await getDocs(collection(db,"users"));
    usersSnap.forEach(async (u) => {
      await addDoc(collection(db,"notifications"),{
        to: u.id,
        type: "validator",
        title,
        body,
        time: serverTimestamp(),
        read: false
      });
    });
    alert("Notification sent to all users 🚀");
    document.getElementById("vTitle").value = "";
    document.getElementById("vBody").value = "";
  }catch(e){
    console.log(e);
    alert("Error sending notification");
  }
};
/* ================= VALIDATOR PANEL ================= */
function validatorPanel(){
  return `
    <hr>
    <h3>Validator Panel</h3>

    <input id="vUser" placeholder="Target User ID (TG_xxx)">
    <select id="vType">
      <option value="deposit">Deposit</option>
      <option value="withdraw">Withdraw</option>
    </select>
    <input id="vAmount" type="number" placeholder="Amount">
    <button onclick="checkUserBalance()">Check Balance</button>
<div id="balanceOut" class="small" style="margin-top:8px"></div>

    <button onclick="validatorAdjust()">Apply</button>

    <hr>
    <button onclick="loadRequests()">Load Pending</button>
    <div id="vout"></div>
    <hr>
<h3>All Users</h3>

<button onclick="loadAllUsers()">Load Users</button>

<div id="userCount" class="small" style="margin-top:6px"></div>
<div id="userList" style="margin-top:10px"></div>

<hr>
<h3>Send Notification</h3>
<input id="vTitle" placeholder="Title (e.g. Merkle Root Updated)">
<input id="vBody" placeholder="Message (details)">
<button onclick="sendValidatorNotification()" 
style="background:#60a5fa;color:#020617;font-weight:bold">
Send Notification
</button>
`;
  
}
  // ================= EOA WALLET =================
window.editEOA = async ()=>{
  const snap = await getDoc(userRef);
  const current = snap.data()?.eoaAddress;

  const addr = prompt(
    "Enter your EOA Wallet Address",
    current || ""
  );

  if(!addr) return;

  if(addr.length < 20){
    alert("Invalid wallet address");
    return;
  }

  // 🔒 LOCK
  if (current) {
    alert("EOA wallet already locked");
    return;
  }

  await updateDoc(userRef,{
    eoaAddress: addr.trim()
  });

  alert("EOA wallet locked successfully");
  renderApp();
};
    
