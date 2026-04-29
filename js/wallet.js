window.primaryAsset = localStorage.getItem("primaryAsset") || "USDC";
window.keepAssetOpen = false;
window.scanDone = false
window.scanTargetId = null
window.filters = {
type:null,
asset:null,
amount:null,
date:null
};
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
window.userData = user;
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
    ${window.getPrimaryBalance()} ${window.primaryAsset}
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

    <hr>${user.pendingRequest? `<div class="warn"> Pending request under review</div>`: ""}

    <div id="receiveScreen" style="display:none">
    <div class="sendHeader">
    <button onclick="closeReceive()" class="backBtn">←</button>
    <h2>Receive ${window.primaryAsset}</h2>
    </div>
    <div class="sendBody" style="text-align:center">
    <div class="qrWrap"><img id="qrImg"></div>
    <p class="small" style="margin-top:10px">
    Only Send Your Assets To This QR Code.
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

              <!-- Assets -->
    <hr>
    <div style="
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-top:10px;">
    <h3 style="margin:0;">Assets</h3>
    <div onclick="openAssetSelector()" style="
    width:28px;
    height:28px;
    border-radius:50%;
    background:#1e293b;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    font-size:18px;">
    +
    </div>
    </div>
    <div style="
    display:flex;
    flex-direction:column;
    gap:10px;
    margin-top:10px;">
                <!-- USDT -->
    <div style="
    background:#020617;
    border:1px solid #1e293b;
    border-radius:12px;
    padding:12px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    cursor:pointer;">
    <div style="display:flex;align-items:center;gap:10px;">
    <img 
    src="./media/tether-usdt-logo.png"
    style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
    <div>
    <div style="font-size:14px">USDT</div>
    </div>
    </div>
    <div style="font-weight:bold">
    ${window.userData?.usdtBalance?.toFixed(2) || "0.00"}
    </div>
    </div>
                 <!-- USDC -->
    <div style="
    background:#020617;
    border:1px solid #1e293b;
    border-radius:12px;
    padding:12px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    cursor:pointer;">
    <div style="display:flex;align-items:center;gap:10px;">
    <img 
    src="./media/usd-coin-usdc-logo.png"
    style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
    <div>
    <div style="font-size:14px">USDC</div>
    </div>
    </div>
    <div style="font-weight:bold">
    ${window.userData?.balance?.toFixed(2) || "0.00"}
    </div>
    </div>   

           <!-- Asset Selector -->
    <div id="assetSelector" style="
    display:none;
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background:#020617;
    z-index:999;
    padding:20px;
    box-sizing:border-box;
    ">
    <h2 style="margin-bottom:20px;">Select Primary Asset</h2>

    <div onclick="closeAssetSelector()" style="
    position:absolute;
    top:15px;
    right:15px;
    font-size:22px;
    cursor:pointer;">
    ✕
    </div>

              <!-- USDT -->
    <div onclick="confirmPrimary('USDT')" style="
    background:#020617;
    border:1px solid #1e293b;
    border-radius:12px;
    padding:12px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    cursor:pointer;
    margin-bottom:10px;
    ">
    <div style="display:flex;align-items:center;gap:10px;">
    <img src="./media/tether-usdt-logo.png" style="width:32px;height:32px;border-radius:50%;">
    <div>
    <div style="font-size:14px">USDT</div>
    ${window.primaryAsset === "USDT" ? `
    <div style="
    font-size:12px;
    color:#22c55e;
    font-weight:600;
    margin-top:2px;
    ">Primary</div>
    ` : ``}
    </div>
    </div>
    <div style="font-weight:bold">
    ${window.userData?.usdtBalance?.toFixed(2) || "0.00"}</div>
    </div>
    
            <!-- USDC -->
    <div onclick="confirmPrimary('USDC')" style="
    background:#020617;
    border:1px solid #1e293b;
    border-radius:12px;
    padding:12px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    cursor:pointer;
    ">
    <div style="display:flex;align-items:center;gap:10px;">
    <img src="./media/usd-coin-usdc-logo.png" style="width:32px;height:32px;border-radius:50%;">
    <div>
    <div style="font-size:14px">USDC</div>
    ${window.primaryAsset === "USDC" ? `
    <div style="
    font-size:12px;
    color:#22c55e;
    font-weight:600;
    margin-top:2px;
    ">Primary</div>
    ` : ``}
    </div>
    </div>
    <div style="font-weight:bold">
    ${window.userData?.balance?.toFixed(2) || "0.00"}
    </div>
    </div>


    <div id="confirmBox" style="
    display:none;
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background:rgba(0,0,0,0.7);
    z-index:1000;
    align-items:center;
    justify-content:center;">

    <div style="
    background:#020617;
    border:1px solid #1e293b;
    border-radius:12px;
    padding:20px;
    width:80%;
    text-align:center;">
    <div id="confirmText" style="margin-bottom:20px;">
    Set as primary?
    </div>

    <div style="display:flex;gap:10px;">
    <button onclick="applyPrimary()" style="
    flex:1;
    padding:10px;
    background:#22c55e;
    border:none;
    border-radius:8px;
    color:white;
    ">Yes</button>

    <button onclick="closeConfirm()" style="
    flex:1;
    padding:10px;
    background:#ef4444;
    border:none;
    border-radius:8px;
    color:white;
    ">No</button>
    </div>
    </div>
    </div>
    </div>

    
     
    
    
    <div id="dwSection" style="display:none;">
    <hr>
    <h3>Deposit / Withdraw</h3>
    <div style="
    display:flex;
    gap:10px;
    margin-top:10px;">
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
    border-radius:12px;">
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
    flex:1;">
    0x710c5D40a97123903b7cB482dBe39EB35D52af0a
    </span>
    <button onclick="copyVault()" style="
    width:auto;
    padding:6px 10px;
    font-size:12px;
    flex-shrink:0;">
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
    word-break:break-all;">
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
    onchange="loadHistoryByDate()"/>
    <div id="history">Loading...</div>
    </div>
    ${isValidator ? validatorPanel() : ""}

    <div id="previewScreen" style="
    display:none;
    position:fixed;
    top:0;
    left:0;
    width:100vw;
    height:100vh;
    background:#000;
    z-index:9999;
    overflow:auto;">
    <div style="width:100%; max-width:380px; margin:0 auto;">
    <div class="sendHeader">
    <button onclick="closePreview()" class="backBtn">←</button>
    <h2 id="previewTitle" style="display:flex;align-items:center;gap:8px;justify-content:center;">
    <span id="previewText">Send ${window.primaryAsset}</span>
    <img id="previewAssetImg"
    src="${window.primaryAsset === 'USDT' 
    ? './media/tether-usdt-logo.png' 
    : './media/usd-coin-usdc-logo.png'}"
    style="width:20px;height:20px;border-radius:50%;">
    </h2>
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
document.getElementById("bottomNav").style.display = "flex";
selectTab("home");
listenNotifications();
  
if(window.keepAssetOpen){
  window.keepAssetOpen = false;
  openAssetSelector();
}
  
       // RECEIVE POPUP
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
if(t.type === "received"){
const key = "rx_" + docSnap.id;
if(!sessionStorage.getItem(key)){
showTxPopup(`Received ${t.amount} ${t.asset || "USDC"} from ${t.counterparty}`);
sessionStorage.setItem(key,"1");
}
}
}
}catch(e){
console.log("Receive popup error", e);
}
}
 /*=============Open Selector ========*/
window.openAssetSelector = function(){
document.getElementById("assetSelector").style.display = "block";
document.getElementById("bottomNav").style.display = "none";
}
window.closeAssetSelector = function(){
document.getElementById("assetSelector").style.display = "none";
document.getElementById("bottomNav").style.display = "flex";
}

window.selectedAsset = null;
window.confirmPrimary = function(asset){
if(asset === window.primaryAsset){
return;
}
  
window.selectedAsset = asset;
document.getElementById("confirmText").innerText =
"Set " + asset + " as primary?";
document.getElementById("confirmBox").style.display = "flex";
}

window.closeConfirm = function(){
document.getElementById("confirmBox").style.display = "none";
}

window.applyPrimary = function(){
window.primaryAsset = window.selectedAsset;
localStorage.setItem("primaryAsset", window.primaryAsset);
document.getElementById("confirmBox").style.display = "none";
window.keepAssetOpen = true;
renderApp();
openAssetSelector();
}

 /*=============Primary Balance ========*/
window.getPrimaryBalance = function(){
if(window.primaryAsset === "USDC"){
return (window.userData.balance || 0).toFixed(2);
}
if(window.primaryAsset === "USDT"){
return (window.userData.usdtBalance || 0).toFixed(2);
}
};
window.setPrimary = function(asset){
window.primaryAsset = asset;
localStorage.setItem("primaryAsset", asset);
renderApp();
};
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
id: wallet,
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

 /*=============Sending UI========*/
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
document.getElementById("bottomNav").style.display = "none";
const asset = window.primaryAsset;
document.getElementById("sendText").innerText = "Send " + asset;
document.getElementById("sendAssetImg").src =
asset === "USDT"
? "./media/tether-usdt-logo.png"
: "./media/usd-coin-usdc-logo.png";
}

window.closeSend = ()=>{
document.getElementById("sendScreen").style.display="none"
document.getElementById("bottomNav").style.display = "flex";
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
const snap = await getDoc(doc(db,"users",toWallet))
if(!snap.exists()){
alert("User not found")
return
}
const asset = window.primaryAsset;
document.getElementById("amountText").innerText = "Send " + asset;
document.getElementById("amountAssetImg").src =
asset === "USDT"
? "./media/tether-usdt-logo.png"
: "./media/usd-coin-usdc-logo.png";
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
const asset = window.primaryAsset;
const balance = asset === "USDC"
? snap.data().balance || 0: snap.data().usdtBalance || 0;
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
toWallet = document.getElementById("sendTo").value.trim(); 
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
document.getElementById("confirmAmount").innerText = "-" + amount + " " + window.primaryAsset;
document.getElementById("confirmTo").innerText = toWallet;
document.getElementById("confirmFrom").innerText = WALLET;
document.getElementById("feeText").innerText ="0 " + window.primaryAsset;
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
toWallet =window.scannedId ||
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
if(window.primaryAsset === "USDC"){
sendUSDC()
}else{
sendUSDT()
}
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
let data;
try{
data = JSON.parse(decodedText);
}catch(e){
alert("Invalid QR");
return;
}
const targetId = data.id;
if((data.type || "").toLowerCase() !== "stabix"){
alert("Invalid QR");
return;
} 
try{
const docSnap = await getDoc(doc(db,"users",targetId))
if(!docSnap.exists()){
alert("User not found")
return
}
window.scannedAsset = window.primaryAsset;
}catch(e){
alert("Error checking user")
return
}
await qrScanner.stop()
document.getElementById("scannerOverlay").style.display = "none"    
document.getElementById("previewId").value = targetId
window.scannedId = targetId  
window.isScanFlow = true;
document.getElementById("previewScreen").style.display = "flex"
document.getElementById("amountScreen").style.display = "none"
const asset = window.primaryAsset;
document.getElementById("previewText").innerText = "Send " + asset;
document.getElementById("previewAssetImg").src =
asset === "USDT"
? "./media/tether-usdt-logo.png"
: "./media/usd-coin-usdc-logo.png";
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
window.scannedAsset = window.primaryAsset;
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
document.getElementById("bottomNav").style.display = "none";
document.getElementById("amountScreen").style.display = "flex";
const asset = window.primaryAsset;
document.getElementById("amountText").innerText = "Send " + asset;
document.getElementById("amountAssetImg").src =
asset === "USDT"
? "./media/tether-usdt-logo.png"
: "./media/usd-coin-usdc-logo.png";
};

window.closePreview = async () => {
document.getElementById("previewScreen").style.display = "none";
document.getElementById("bottomNav").style.display = "flex";
scanDone = false;
};

/* ================= Refresh ================= */
let refreshCount = 0;
window.softRefresh = async function(){
if(refreshCount >= 1){
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
document.getElementById("bottomNav").style.display = "none";
const q = query(
collection(db, "notifications"),
where("to", "==", WALLET)
);
const snap = await getDocs(q);
const docs = snap.docs.sort((a, b) => {
return b.data().time?.seconds - a.data().time?.seconds;
});
const now = Date.now();
const docsFiltered = docs.filter(docSnap => {
const d = docSnap.data();
if(!d.time) return false;
const t = d.time.seconds * 1000;
const unreadLimit = 7 * 24 * 60 * 60 * 1000; // 7 days
const readLimit = 3 * 24 * 60 * 60 * 1000;   // 3 days
if(d.read){
return (now - t) < readLimit;
} else {
return (now - t) < unreadLimit;
}
});
let html = `
<div style="background:#000;min-height:100vh;padding:16px">
<div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
<span onclick="renderApp()" style="cursor:pointer;font-size:20px">←</span>
<span style="font-weight:bold;font-size:18px">Notifications</span>
</div>
`;
  
if (snap.empty) {
html += `<div style="opacity:.6">No notifications</div>`;
}
let lastDate = "";
docsFiltered.forEach(docSnap => {
const d = docSnap.data();
const currentDate = formatRelativeDate(d.time);
if (currentDate !== lastDate) {
html += `
<div style="
margin-top:18px;
margin-bottom:6px;
font-size:17px;
font-weight:700;
color:#60a5fa;
letter-spacing:0.3px;">
${currentDate}
</div>
<div style="
height:1px;
background:rgba(255,255,255,0.06);
margin-bottom:10px;">
</div>
`;
lastDate = currentDate;
}
  
html += `
<div onclick="openNotifDetail('${docSnap.id}')"
style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.06);cursor:pointer;${!d.read ? 'background:rgba(96,165,250,0.08);border-left:3px solid #60a5fa;padding-left:10px;' : ''}">
<div style="font-weight:600;font-size:15px;margin-bottom:4px">
<span style="${!d.read ? 'font-weight:700' : 'font-weight:600'}">
${d.title || "Notification"}
</span>
</div>
<div style="font-size:12px;opacity:.5">
${formatTime(d.time)}
</div>
</div>
`;
});
html += `</div>`;
appDiv(html);
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

function formatRelativeDate(ts){
if(!ts) return "";
const now = new Date();
const date = new Date(ts.seconds * 1000);
const diffTime = now - date;
const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
if(diffDays === 0) return "Today";
if(diffDays === 1) return "Yesterday";
if(diffDays === 2) return "2 days ago";
if(diffDays === 3) return "3 days ago";
return date.toLocaleDateString("en-IN", {
day: "2-digit",
month: "short",
year: "numeric"
});
}

window.openNotifDetail = async (id) => {
const docRef = doc(db, "notifications", id);
await updateDoc(docRef, { read: true });
const snap = await getDoc(docRef);
if(!snap.exists()) return;
const d = snap.data();
let html = `
<div style="
background:#000;
min-height:100vh;
padding:16px;">
<div style="
display:flex;
align-items:center;
gap:10px;
margin-bottom:20px;">

<span onclick="openNotifications()" style="
cursor:pointer;
font-size:20px;
">←</span>
<span style="
font-weight:bold;
font-size:18px;">
Notification
</span>
</div>
<div style="
background:#020617;
border-radius:16px;
padding:16px;
border:1px solid rgba(255,255,255,0.05);">
<div style="
font-size:17px;
font-weight:bold;
margin-bottom:10px;">
${d.title || "Notification"}
</div>
<div style="
font-size:14px;
line-height:1.5;
opacity:.85;
margin-bottom:15px;
word-break:break-word;">
${d.body || ""}
</div>
<div style="
font-size:12px;
opacity:.5;">
</div>
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
alert("Notification sent to all users ");
document.getElementById("vTitle").value = "";
document.getElementById("vBody").value = "";
}catch(e){
console.log(e);
alert("Error sending notification");
}
};

/* ================= Navigation ================= */
window.navigateHome = async () => {
try {
await renderApp();
const send = document.getElementById("sendScreen");
const amount = document.getElementById("amountScreen");
const confirm = document.getElementById("confirmScreen");
if (send) send.style.display = "none";
if (amount) amount.style.display = "none";
if (confirm) confirm.style.display = "none";
selectTab("home");
} catch (e) {
console.log("navigateHome error:", e);
}
};

window.goDeposit = async () => {
const snap = await getDoc(userRef);
const user = snap.data();
document.querySelector(".box").innerHTML = `
<h2>Select Asset</h2>
<div style="display:flex;flex-direction:column;gap:12px;margin-top:15px;">

<div onclick="selectDWAsset('USDT')" style="
background:#020617;
border:1px solid #1e293b;
border-radius:12px;
padding:14px;
display:flex;
justify-content:space-between;
align-items:center;
cursor:pointer;">
<div style="display:flex;align-items:center;gap:10px;">
<img src="./media/tether-usdt-logo.png" style="width:32px;height:32px;border-radius:50%;">
<div>USDT</div>
</div>
<div style="font-weight:bold">
${user.usdtBalance?.toFixed(2) || "0.00"}
</div>
</div>

<div onclick="selectDWAsset('USDC')" style="
background:#020617;
border:1px solid #1e293b;
border-radius:12px;
padding:14px;
display:flex;
justify-content:space-between;
align-items:center;
cursor:pointer;">
<div style="display:flex;align-items:center;gap:10px;">
<img src="./media/usd-coin-usdc-logo.png" style="width:32px;height:32px;border-radius:50%;">
<div>USDC</div>
</div>
<div style="font-weight:bold">
${user.balance?.toFixed(2) || "0.00"}
</div>
</div>

<div style="margin-top:25px;">
<div style="
font-weight:600;
font-size:14px;
opacity:0.8;
margin-bottom:10px;">
Recent Activity
</div>
<div id="recentTxs"></div> 
</div>
`;
(async () => {
const q = query(
collection(db, "transactions"),
where("userId", "==", WALLET));
const snap = await getDocs(q);
let arr = [];
snap.forEach(d => {
const t = d.data();
if(t.type === "deposit" || t.type === "withdraw"){
arr.push({...t,_time: t.createdAt?.seconds || 0});
}
});
arr.sort((a,b)=> b._time - a._time);
arr = arr.slice(0,5);
let html = "";
arr.forEach(t => {
const isDeposit = t.type === "deposit";
const time = t.createdAt
? new Date(t.createdAt.seconds * 1000).toLocaleString("en-IN", {
day: "2-digit",
month: "short",
hour: "2-digit",
minute: "2-digit"
})
: "";
html += `
<div style="
display:flex;
justify-content:space-between;
padding:10px 0;
border-bottom:1px solid rgba(255,255,255,0.05);">
<div style="font-size:13px;">
<div>${isDeposit ? "Deposit" : "Withdraw"}</div>
<div style="font-size:11px;opacity:0.6;">${time}</div>
</div>
<div style="
font-weight:600;
color:${isDeposit ? "#22c55e" : "#ef4444"};">
${isDeposit ? "+" : "-"} ${t.amount} ${t.asset || ""}
</div>
</div>
`;
});
document.getElementById("recentTxs").innerHTML =
html || `<div style="opacity:0.5;">No recent D/W</div>`;
})(); 
selectTab("deposit");
};

window.goHistory = () => {
document.querySelector(".box").innerHTML = `
<h2>Transaction History</h2>
<div style="
margin-top:12px;
">
<div style="
position:relative;
">
<input
id="searchInput"
placeholder="Search transactions..."
style="
width:100%;
padding:12px 14px 12px 38px;
border-radius:10px;
border:1px solid #1e293b;
background:#020617;
color:#e5e7eb;
font-size:14px;
box-sizing:border-box;
outline:none;
"onfocus="this.style.border='1px solid #2563eb'"
onblur="this.style.border='1px solid #1e293b'"
>
<svg viewBox="0 0 24 24" fill="none" style="
position:absolute;
left:12px;
top:60%;
transform:translateY(-50%);
width:16px;
height:16px;
opacity:0.6;
pointer-events:none;
">
<circle cx="11" cy="11" r="7" stroke="white" stroke-width="2"/>
<path d="M20 20L17 17" stroke="white" stroke-width="2" stroke-linecap="round"/>
</svg>
</div>
</div>

<div id="filterBar" style="
display:flex;
gap:8px;
overflow-x:auto;
margin:10px 0;
">
<button onclick="openFilter('date')" class="fbtn">Date ▼</button>
<button id="assetFilterBtn" onclick="openFilter('asset')" class="fbtn">Asset ▼</button>
<button id="amountFilterBtn" onclick="openFilter('amount')" class="fbtn">Amount ▼</button>
<button id="typeFilterBtn" onclick="openFilter('type')" class="fbtn">Type ▼</button>
</div>

<div id="history" style="padding-bottom:100px;">Loading...</div>
`;
loadHistoryByDate();
setTimeout(setupHistorySearch, 100);
selectTab("history");
};







/* ================= Setting Navigation ================= */
window.goSettings = () => {
selectTab("settings");
document.querySelector(".box").innerHTML = `
<!-- TITLE -->
<div style="font-size:20px;font-weight:700;margin-bottom:20px;">
Settings
</div>
<!-- LIST -->
<div>
<div onclick="openSecurity()" style="
display:flex;
justify-content:space-between;
padding:14px 0;
border-bottom:1px solid rgba(255,255,255,0.06);
cursor:pointer;
">
<div>Security</div>
<div style="opacity:0.5;">›</div>
</div>
</div>

<div onclick="openSupport()" style="
display:flex;
justify-content:space-between;
padding:14px 0;
border-bottom:1px solid rgba(255,255,255,0.06);
cursor:pointer;
">
<div>Support</div>
<div style="opacity:0.5;">›</div>
</div>

<div onclick="openAbout()" style="
display:flex;
justify-content:space-between;
padding:14px 0;
border-bottom:1px solid rgba(255,255,255,0.06);
cursor:pointer;
">
<div>About</div>
<div style="opacity:0.5;">›</div>
</div>
<!-- LOGOUT -->
<div onclick="logout()" style="
margin-top:30px;
text-align:center;
color:#ef4444;
font-weight:600;
cursor:pointer;
">
Logout
</div>
`;
};

window.openSecurity = () => {
document.querySelector(".box").innerHTML = `
<!-- HEADER -->
<div onclick="goSettings()" style="
margin-bottom:15px;
cursor:pointer;
opacity:0.7;
">← Back</div>

<div style="font-size:18px;font-weight:600;margin-bottom:20px;">
Security & Privacy
</div>

<div style="font-size:13px;opacity:0.7;line-height:1.6;">
Never share your private key or wallet credentials with anyone.
StabiX is non-custodial and cannot recover lost access.
</div>
`;
};
window.openSupport = () => {
document.querySelector(".box").innerHTML = `
<!-- HEADER -->
<div onclick="goSettings()" style="
margin-bottom:15px;
cursor:pointer;
opacity:0.7;
">← Back</div>

<div style="font-size:18px;font-weight:600;margin-bottom:20px;">
Support
</div>

<div style="
font-size:13px;
opacity:0.8;
margin-bottom:20px;
line-height:1.6;
">
Need help or facing an issue? Reach out to our support team.
</div>
<div onclick="window.open('https://t.me/StabiXSupport')" style="
padding:14px;
border-radius:12px;
background:#0b1220;
border:1px solid rgba(255,255,255,0.06);
cursor:pointer;
text-align:center;
font-weight:600;
">
Contact on Telegram
</div>
`;
};
window.openAbout = () => {
document.querySelector(".box").innerHTML = `
<!-- HEADER -->
<div onclick="goSettings()" style="
margin-bottom:15px;
cursor:pointer;
opacity:0.7;
">← Back</div>

<div style="font-size:18px;font-weight:600;margin-bottom:20px;">
About
</div>
<div style="
font-size:15px;
font-weight:600;
margin-bottom:8px;
">
What is StabiX?
</div>
<div style="
font-size:13px;
opacity:0.8;
line-height:1.6;
margin-bottom:18px;
">
StabiX is a non-custodial payment and vault system designed to enable fast, low-cost stablecoin transactions with minimal complexity. It allows users to deposit assets on-chain while maintaining a simplified off-chain balance experience.
The system is built to support instant transfers and microtransactions without relying on traditional custodial infrastructure, giving users full control over their funds at all times.
</div>

<div style="
font-size:15px;
font-weight:600;
margin-bottom:8px;
">
Problem StabiX Solves
</div>

<div style="
font-size:13px;
opacity:0.8;
line-height:1.6;
margin-bottom:18px;
">
  Stablecoin transactions are reliable but still depend on blockchain-level execution for every transfer. This introduces delays, repeated gas costs, and multiple steps such as network selection, confirmations, and manual interaction.
For frequent usage, microtransactions, or everyday payments, this model becomes inefficient. Users are required to pay network fees repeatedly and wait for confirmations, even for small-value transfers.
StabiX addresses these limitations by abstracting repetitive blockchain interactions into a simplified system. Once assets are deposited on-chain, users can perform instant transfers within StabiX without paying gas fees for each action.
This enables a smoother experience for microtransactions, high-frequency usage, and real-time payments, while still maintaining a non-custodial structure backed by on-chain verification.
</div>

<div style="
font-size:15px;
font-weight:600;
margin-bottom:8px;
">
How StabiX Works
</div>

<div style="
font-size:13px;
opacity:0.8;
line-height:1.6;
margin-bottom:18px;
">
StabiX combines on-chain asset custody with an off-chain execution layer to deliver instant, efficient transactions while maintaining verifiable ownership.

<br><br>
<b>1. Deposit (On-Chain Lock)</b><br>
Users initiate the process by sending stablecoins (such as USDT or USDC) to a designated vault address on a supported blockchain network. This transaction is executed entirely on-chain and remains fully verifiable through public blockchain explorers.
Once the transaction is confirmed, the deposited assets are effectively locked within the vault smart contract.

<br><br>
<b>2. Balance Minting (Off-Chain Representation)</b><br>
After successful verification of the deposit transaction, StabiX mints an equivalent balance within its system. This minted balance represents the user's claim on the locked assets.
This step eliminates the need for repeated blockchain interaction, allowing users to operate within StabiX instantly without incurring gas fees for every action.

<br><br>
<b>3. Instant Transactions (Off-Chain Execution)</b><br>
Once funds are minted, users can perform transfers instantly within the StabiX environment. These transactions do not require on-chain confirmations and are executed in real-time.
This makes StabiX particularly efficient for microtransactions and high-frequency usage, where traditional blockchain interactions would otherwise introduce delays and repeated costs.

<br><br>
<b>4. Withdrawal Request (Balance Burn)</b><br>
When a user initiates a withdrawal, the corresponding amount is permanently burned from their StabiX balance. This ensures that the off-chain representation always remains fully backed by the locked on-chain assets.

<br><br>
<b>5. Merkle-Based Claim (On-Chain Redemption)</b><br>
Withdrawal requests are processed in batches, where a validator aggregates requests and generates a Merkle root. Each user receives a unique proof (leaf) corresponding to their withdrawal.
Using this proof, the user can independently claim their funds directly from the vault smart contract using their own wallet.

<br><br>
<b>6. Final Settlement</b><br>
The withdrawal is completed entirely on-chain, ensuring that users regain full custody of their assets without reliance on intermediaries.
This architecture ensures that while StabiX enables instant and efficient transactions off-chain, the final ownership and settlement always remain verifiable and enforceable on-chain.
</div>

<div style="
font-size:15px;
font-weight:600;
margin-bottom:8px;
">
Non-Custodial Architecture
</div>

<div style="
font-size:13px;
opacity:0.8;
line-height:1.6;
margin-bottom:18px;
">
StabiX is designed as a non-custodial system where users retain full ownership and control over their funds at all times.

<br><br>
Unlike traditional platforms that hold and manage user balances, StabiX does not have direct access to user assets. All deposited funds are secured within on-chain vault smart contracts, and can only be accessed using valid cryptographic proofs and the user's private key.

<br><br>
<b>No Direct Control Over Funds</b><br>
StabiX cannot move, withdraw, or freeze user funds. There is no mechanism that allows the system or its operators to access assets inside the vault.

<br><br>
<b>User-Executed Withdrawals</b><br>
Withdrawals are not processed by StabiX on behalf of the user. Instead, users must claim their funds themselves using a valid Merkle proof (Leaf) generated after validator submission.

<br><br>
<b>Private Key Ownership</b><br>
Only the holder of the correct private key can execute the withdrawal transaction. Without the user's private key, no entity including StabiX can access the funds.

<br><br>
<b>Trust-Minimized System</b><br>
The architecture eliminates the need to trust a centralized custodian. Security is enforced through smart contracts and cryptographic verification rather than platform control.

<br><br>
This approach ensures that StabiX functions as an execution layer rather than a custodian, giving users full sovereignty over their assets while still benefiting from instant off-chain transactions.
</div>

<div style="
font-size:15px;
font-weight:600;
margin-bottom:8px;
">
Withdrawal Process & User Responsibility
</div>

<div style="
font-size:13px;
opacity:0.8;
line-height:1.6;
margin-bottom:18px;
">
Withdrawals in StabiX follow a structured process involving balance burn, batch processing, and Merkle-based claim execution. Users must understand and correctly follow each step.

<br><br>
<b>1. Balance Burn on Withdrawal Request</b><br>
When a withdrawal is submitted, the specified amount is permanently burned from the user’s StabiX balance. This action is irreversible and ensures that the off-chain balance remains fully backed by on-chain assets.

<br><br>
<b>2. Batch Processing & Merkle Root Generation</b><br>
All withdrawal requests are grouped and processed in batches. A validator generates a Merkle root from these requests, and each user receives a unique proof (Leaf) corresponding to their withdrawal details.

<br><br>
<b>3. Fixed Recipient (EOA Binding)</b><br>
The withdrawal is strictly bound to the EOA wallet address provided at the time of submission. The Merkle leaf is generated using this exact address.
This means:

<div style="margin-left:10px; line-height:1.6;">
<div>• Funds can only be claimed by the same EOA</div>
<div>• Changing the address later is not possible</div>
<div>• If an incorrect address is submitted, funds cannot be recovered</div>
</div>

<br><br>
<b>4. Claim Window (Time-Limited Execution)</b><br>
Once the Merkle root is published, users have a limited time window (up to <b>24 hours</b>) to claim their funds using the provided Leaf.
If the withdrawal is not executed within this period:

<div style="margin-left:10px;">
<div>• The Leaf will expire</div>
<div>• The withdrawal becomes invalid</div>
<div>• The burned balance will not be restored</div>
</div>

<br><br>
<b>5. User-Executed Withdrawal</b><br>
StabiX does not transfer funds automatically. Users must manually execute the withdrawal from the vault smart contract using their own wallet and private key.
Only the wallet (EOA) used during submission can successfully complete this process.

<br><br>
<b>6. No System Access to Funds</b><br>
StabiX does not have the ability to withdraw, redirect, or access user funds. The system cannot override wallet ownership or execute withdrawals on behalf of users.
Fund access is strictly controlled by:

<div style="margin-left:10px; line-height:1.6;">
<div>• The correct EOA wallet</div>
<div>• The valid Merkle proof (Leaf)</div>
<div>• The user’s private key</div>
</div>

<br><br>
<b>7. User Responsibility</b><br>
Users are fully responsible for:

<div style="margin-left:10px; line-height:1.6;">
<div>• Entering the correct EOA wallet address</div>
<div>• Providing accurate withdrawal amount</div>
<div>• Monitoring notifications for Leaf availability</div>
<div>• Executing withdrawal within the valid time window</div>
</div>

<div style="margin-top:6px;">
  Any incorrect input or failure to complete the process may result in permanent loss of funds.
</div>
      
</div>

<div style="
font-size:15px;
font-weight:600;
margin-bottom:8px;
">
Vision
</div>
<div style="
font-size:13px;
opacity:0.8;
line-height:1.6;
margin-bottom:18px;
">
StabiX is designed to bridge the gap between blockchain security and real world usability by combining on-chain asset custody with instant off-chain execution.

<br><br>
The goal is to enable a system where users can move value instantly, without being limited by network delays, repeated fees, or complex transaction flows, while still retaining full control over their assets.

<br><br>
By removing unnecessary blockchain interactions and introducing a streamlined execution layer, StabiX makes stablecoin usage more practical for everyday payments, microtransactions, and high frequency activity.

<br><br>
At its core, StabiX is not built to replace blockchains, but to enhance how users interact with them reducing friction while preserving transparency, security, and self-custody.

<br><br>
The long term vision is to create a scalable, efficient, and trust-minimized financial layer where users can operate seamlessly across networks without compromising ownership or control.
</div>

<div style="
font-size:15px;
font-weight:600;
margin-bottom:8px;
">
Founder
</div>
<div style="
font-size:13px;
opacity:0.8;
line-height:1.6;
margin-bottom:18px;
">
<b>Sumedh Dabhade</b><br><br>
StabiX is developed by Sumedh Dabhade, focused on building efficient and practical non-custodial financial systems.
The project is driven by a goal to simplify blockchain interactions while preserving user ownership, transparency, and security.
StabiX reflects an approach centered on reducing friction in digital payments without compromising the core principles of decentralization.
</div>
`;
};
/* ================= Setting Navigation Finish================= */








window.selectTab = function(tab){
["home","deposit","history","settings"].forEach(t=>{
const el = document.getElementById("tab-"+t);
if(el) el.classList.remove("nav-item-active");
});
const active = document.getElementById("tab-"+tab);
if(active) active.classList.add("nav-item-active");
}
 /* ================= Filter ================= */
window.openFilter = (type)=>{
let html = "";
if(type === "amount"){
html = `
<div class="sheet">
<h3 style="margin:0 0 12px 0;">Amount Filter</h3>
<div class="assetList">
<div class="assetItem" onclick="setAmountRange(0,50)">
<span>0 - 50</span>
</div>
<div class="assetItem" onclick="setAmountRange(50,500)">
<span>50 - 500</span>
</div>
<div class="assetItem" onclick="setAmountRange(500,null)">
<span>500+</span>
</div>
</div>
<button onclick="clearAmountFilter()" 
style="margin-top:10px;width:100%;padding:12px;border-radius:12px;
background:#1e293b;color:#e5e7eb;border:none;">
Clear Filter
</button>
<button onclick="applyFilter('amount')" class="applyBtn">
  Apply Filter
</button>
</div>
`;
}
  
if(type === "type"){
html = `
<div class="sheet">
<h3 style="margin:0 0 12px 0;">Transaction Type</h3>
<div class="assetList">
<div class="assetItem" onclick="setType('sent')">
<span>Sent</span>
</div>
<div class="assetItem" onclick="setType('received')">
<span>Received</span>
</div>
<div class="assetItem" onclick="setType('deposit')">
<span>Deposit</span>
</div>
<div class="assetItem" onclick="setType('withdraw')">
<span>Withdraw</span>
</div>
</div>
<button onclick="clearTypeFilter()" 
style="margin-top:10px;width:100%;padding:12px;border-radius:12px;
background:#1e293b;color:#e5e7eb;border:none;">
Clear Filter
</button>
<button onclick="applyFilter('type')" class="applyBtn">
Apply
</button>
</div>
`;
}

if(type === "asset"){
html = `
<div class="sheet">
<h3 style="margin:0 0 12px 0;">Select Asset</h3>
<div class="assetList">
<div class="assetItem" onclick="setAsset('USDT')">
<img src="media/tether-usdt-logo.png" />
<span>USDT</span>
</div>
<div class="assetItem" onclick="setAsset('USDC')">
<img src="media/usd-coin-usdc-logo.png" />
<span>USDC</span>
</div>
</div>

<button onclick="clearAssetFilter()" 
style="margin-top:10px;width:100%;padding:12px;border-radius:12px;
background:#1e293b;color:#e5e7eb;border:none;">
Clear Filter
</button>

<button onclick="applyFilter('asset')" class="applyBtn">
  Apply
</button>

</div>
`;
}
if(type === "date"){
const today = new Date().toISOString().split("T")[0];
html = `
<div class="sheet">
<h3 style="margin:0 0 10px 0;">Select Date</h3>
<input type="date" id="filterDate" value="${today}" max="${today}" />

<div style="margin-top:12px; width:100%;">
<button onclick="enableRange()" style="width:100%;padding:12px;border-radius:10px;background:#1e293b;color:white;border:none;">
Custom Date 
</button>
</div>
<div id="rangeBox" style="display:none; margin-top:12px; width:100%;">
<label>From</label>
<input type="date" id="fromDate" />
<label style="margin-top:8px;display:block;">To</label>
<input type="date" id="toDate" />
</div>

<button onclick="clearDateFilter()" 
style="margin-top:10px;width:100%;padding:12px;border-radius:12px;
background:#1e293b;color:#e5e7eb;border:none;">
Clear Filter
</button>

<button onclick="applyFilter('date')">
Apply Filter
</button>
</div>
`;
}
document.body.insertAdjacentHTML("beforeend", `
<div id="overlay" onclick="closeFilter()"></div>
<div id="bottomSheet">${html}</div>
`);
setTimeout(() => {
const input = document.getElementById("filterDate");
const today = new Date().toISOString().split("T")[0];
if(input){
input.value = today;
input.max = today;
}
}, 0);
};

window.closeFilter = ()=>{
document.getElementById("overlay")?.remove();
document.getElementById("bottomSheet")?.remove();
};

window.applyFilter = (type)=>{
window.filters = window.filters || {};

if(type === "date"){
const single = document.getElementById("filterDate")?.value;
const from = document.getElementById("fromDate")?.value;
const to = document.getElementById("toDate")?.value;
if(from && to){
if(from > to){
alert("From date cannot be after To date");
return;
}
window.filters.fromDate = from;
window.filters.toDate = to;
delete window.filters.date;
}
else{
window.filters.date = single || null;
delete window.filters.fromDate;
delete window.filters.toDate;
}
}
closeFilter();
const btn = document.querySelector('[onclick="openFilter(\'date\')"]');
if(window.filters.fromDate && window.filters.toDate){
btn.innerText = window.filters.fromDate + " → " + window.filters.toDate;
} else {
btn.innerText = window.filters.date || "Date ▼";
}
window.loadHistory();

if(type === "asset"){
const val = window.filters.asset || null;
window.filters.asset = val;
document.querySelector('[onclick="openFilter(\'asset\')"]')
.innerText = val || "Asset ▼";
}
  
if(type === "amount"){
const min = document.getElementById("minAmount")?.value;
const max = document.getElementById("maxAmount")?.value;
window.filters.minAmount =window.filters.tempMin ?? (min ? Number(min) : null);
window.filters.maxAmount =window.filters.tempMax ?? (max ? Number(max) : null);
let label = "Amount ▼";
if(window.filters.minAmount != null && window.filters.maxAmount != null){
label = `${window.filters.minAmount} - ${window.filters.maxAmount}`;
} else if(window.filters.minAmount != null){
label = `${window.filters.minAmount}+`;
} else if(window.filters.maxAmount != null){
label = `< ${window.filters.maxAmount}`;
}
document.getElementById("amountFilterBtn").innerText = label;
}

if(type === "type"){
const val = window.filters.type || null;
window.filters.type = val;
const btn = document.getElementById("typeFilterBtn");
if(btn) btn.innerText = val ? val.charAt(0).toUpperCase() + val.slice(1) : "Type ▼";
}  
};

window.enableRange = () => {
document.getElementById("rangeBox").style.display = "block";
const today = new Date().toISOString().split("T")[0];
document.getElementById("fromDate").max = today;
document.getElementById("toDate").max = today;
};

window.clearFilters = () => {
window.filters = {};
document.querySelector('[onclick="openFilter(\'date\')"]')
.innerText = "Date ▼";
document.querySelector('[onclick="openFilter(\'asset\')"]')
.innerText = "Asset ▼";
document.querySelector('[onclick="openFilter(\'amount\')"]')
.innerText = "Amount ▼";
document.querySelector('[onclick="openFilter(\'type\')"]')
.innerText = "Type ▼";
closeFilter();
window.loadHistory();
};

window.setAsset = (asset) => {
window.filters.asset = asset;
document.querySelectorAll('.assetItem').forEach(el=>{
el.style.border = '1px solid #1e293b';
});
event.currentTarget.style.border = '1px solid #2563eb';
};

window.clearAssetFilter = () => {
window.filters.asset = null;
document.getElementById("assetFilterBtn").innerText = "Asset ▼";
closeFilter();
loadHistory();
};

window.setAmountRange = (min, max) => {
window.filters.tempMin = min;
window.filters.tempMax = max;
document.querySelectorAll('.assetItem').forEach(el=>{
el.style.border = "1px solid #1e293b";
});
event.currentTarget.style.border = "1px solid #2563eb";
};

window.clearAmountFilter = () => {
window.filters.minAmount = null;
window.filters.maxAmount = null;
const btn = document.getElementById("amountFilterBtn");
if(btn) btn.innerText = "Amount ▼";
closeFilter();
loadHistory();
};
window.clearDateFilter = () => {
window.filters.date = null;
window.filters.fromDate = null;
window.filters.toDate = null;
document.querySelector('[onclick="openFilter(\'date\')"]')
.innerText = "Date ▼";
closeFilter();
loadHistory();
};

window.setType = (type) => {
window.filters.type = type;
document.querySelectorAll('.assetItem').forEach(el=>{
el.style.border = '1px solid #1e293b';
});
event.currentTarget.style.border = '1px solid #2563eb';
};

window.clearTypeFilter = () => {
window.filters.type = null;
const btn = document.getElementById("typeFilterBtn");
if(btn) btn.innerText = "Type ▼";
closeFilter();
loadHistory();
};

// ==================Deposit Withdraw Logic==================//
window.selectDWAsset = (asset) => {
window.selectedDWAsset = asset;
document.querySelector(".box").innerHTML = `
<div style="
display:flex;
flex-direction:column;
align-items:center;
margin-top:20px;
gap:10px;
">
<img 
src="${asset === 'USDT' 
? './media/tether-usdt-logo.png' 
: './media/usd-coin-usdc-logo.png'}"
style="
width:60px;
height:60px;
border-radius:50%;
">
<div style="
font-size:20px;
font-weight:bold;
">
${asset}
</div>
</div>
<div style="display:flex;gap:12px;margin-top:30px;">
<button onclick="openDeposit('${asset}')" style="
flex:1;
padding:14px;
border-radius:12px;
background:#22c55e;
color:#022c22;
font-weight:bold;">
Deposit
</button>
<button onclick="openWithdrawNetwork('${asset}')" style="
flex:1;
padding:14px;
border-radius:12px;
background:#ef4444;
color:white;
font-weight:bold;">
Withdraw
</button>
</div>
<div style="
margin-top:25px;
background:#0b1220;
border:1px solid rgba(255,255,255,0.06);
border-radius:14px;
padding:14px;
">
<div style="
font-size:14px;
font-weight:600;
margin-bottom:10px;
opacity:0.9;
">
Asset Selected
</div>
<ul style="
font-size:12px;
opacity:0.7;
line-height:1.6;
padding-left:16px;
">
<li>You have selected <b>${asset}</b> for your transaction.</li>
<li>All deposits and withdrawals initiated from this page will be processed in <b>${asset}</b> only.</li>
<li>Please ensure you choose the correct network in the next step before proceeding.</li>
<li>Sending or requesting unsupported assets may result in permanent loss.</li>
<li>Review all transaction details carefully before submission.</li>
</ul>
</div>
<div onclick="goDeposit()" style="
position:absolute;
top:20px;
left:20px;
width:40px;
height:40px;
display:flex;
align-items:center;
justify-content:center;
border-radius:10px;
background:rgba(255,255,255,0.05);
backdrop-filter:blur(6px);
font-size:22px;
cursor:pointer;
">
←
</div>
`;
};

window.openAssetPage = function(asset){
window.selectedDWAsset = asset;
selectDWAsset(asset);
}
// ================== VAULT CONFIG (COMMON) ==================
const VAULTS = {
"Ethereum ERC20": "0x0201B73BA3d4a43012c84B871c7d5332E176ffcc",
"Arbitrum L2": "0xARB_VAULT",
"Polygon PoS": "0xPOLY_VAULT",
"Base L2": "0xBASE_VAULT",
"Tron TRC20": "TXYZ_TRON_VAULT"
};
const EXPLORERS = {
"Ethereum ERC20": "https://etherscan.io/address/",
"Arbitrum L2": "https://arbiscan.io/address/",
"Polygon PoS": "https://polygonscan.com/address/",
"Base L2": "https://basescan.org/address/"
};
// ================= OPEN FUNCTIONS =================
function networkCard(asset, name, type, speed, fee){
return `
<div onclick="selectNetwork('${asset}','${name} ${type}')"
style="
padding:14px;
border-radius:14px;
background:#0b1220;
border:1px solid rgba(255,255,255,0.06);
cursor:pointer;
">
<!-- NETWORK NAME -->
<div style="font-weight:600;font-size:15px;">${name}
<span style="opacity:0.5;font-size:12px;"> ${type}</span>
</div>
<!-- SPEED -->
<div style="font-size:12px;opacity:0.6;margin-top:6px;">
Speed: ${speed}
</div>
<!-- FEE -->
<div style="font-size:12px;opacity:0.6;">
Fee: ${fee}
</div>
</div>
`;
}
// ================== PAGE 3 ==================//
window.openDeposit = function(asset){
document.querySelector(".box").innerHTML = `
<!-- HEADER -->
<div style="display:flex;align-items:center;gap:10px;margin-bottom:15px;">
<div onclick="openAssetPage('${asset}')"style="
width:36px;
height:36px;
display:flex;
align-items:center;
justify-content:center;
border-radius:10px;
background:rgba(255,255,255,0.05);
cursor:pointer;
font-size:18px;
">←</div>
<div style="font-size:18px;font-weight:600;">
Select Network
</div>
</div>
<!-- NETWORK LIST -->
<div style="display:flex;flex-direction:column;gap:12px;">
${networkCard(asset,"Ethereum","ERC20","~2 min","$5 fee")}
${networkCard(asset,"Arbitrum","L2","~10 sec","Low fee")}
${networkCard(asset,"Polygon","PoS","~5 sec","Very low")}
${networkCard(asset,"Base","L2","~5 sec","Low fee")}
</div>
`;
}
// ================== PAGE 4 ==================
// VAULT + TX HASH + AMOUNT + EOA
window.selectNetwork = function(asset, network){
const vault = VAULTS[network] || "Not available";
document.querySelector(".box").innerHTML = `
<!-- HEADER -->
<div style="display:flex;align-items:center;gap:10px;margin-bottom:15px;">
<div onclick="openDeposit('${asset}')" style="
width:36px;
height:36px;
display:flex;
align-items:center;
justify-content:center;
border-radius:10px;
background:rgba(255,255,255,0.05);
cursor:pointer;
font-size:18px;
">←</div>
<div style="font-size:18px;font-weight:600;">
${asset} Deposit
</div>
</div>
<!-- NETWORK -->
<div style="
background:#0b1220;
padding:12px;
border-radius:12px;
border:1px solid rgba(255,255,255,0.06);
margin-bottom:10px;">
<div style="font-size:12px;opacity:0.6;">Network</div>
<div>${network}</div>
</div>
<!-- VAULT -->
<div style="
background:#0b1220;
padding:12px;
border-radius:12px;
border:1px solid rgba(255,255,255,0.06);
margin-bottom:15px;">
<div style="font-size:12px;opacity:0.6;">Vault Address</div>
<a href="${EXPLORERS[network]}${vault}" target="_blank" style="
font-size:13px;
color:#60a5fa;
word-break:break-all;
text-decoration:none;">
${vault}
</a>
</div>
<!-- INPUT -->
<input id="amount" placeholder="Amount" style="width:100%;margin-bottom:10px;">
<input id="txHash" placeholder="Transaction Hash" style="width:100%;margin-bottom:10px;">
<input id="eoa" placeholder="Your Wallet Address" style="width:100%;margin-bottom:15px;">
<!-- SUBMIT -->
<button onclick="submitDepositFinal('${asset}','${network}')" style="
width:100%;
padding:14px;
border-radius:12px;
background:#22c55e;
color:black;
font-weight:600;
">
Submit Deposit
</button>
<div style="
margin-top:15px;
margin-bottom:100px;
background:#0b1220;
padding:12px;
border-radius:12px;
border:1px solid rgba(255,255,255,0.06);
font-size:12px;
opacity:0.75;
line-height:1.6;">
<b style="opacity:0.95;font-size:16px;font-weight:700;">
⚠️ Read Before Deposit ⚠️
</b><br><br>
<b style="opacity:0.9;">Deposit Instructions</b><br>
• You must first approve and deposit funds from your EOA wallet. This action requires your private key signature to on chain vault interaction.<br>
• Ensure you are using your own wallet (EOA). Never share your private key or wallet credentials with anyone.<br>
• Only deposit supported assets (USDT / USDC) on the selected network.<br>
• Sending assets from the wrong network or unsupported tokens will result in permanent loss of funds.<br><br>

<b style="opacity:0.9;">On-Chain Deposit Process</b><br>
• Deposit must be executed directly from your wallet to the provided vault address.<br>
• After completing the transaction, you must submit the same wallet address (EOA), transaction hash, and exact deposited amount.<br>
• Incorrect or mismatched details may lead to rejection or delay in processing.<br><br>

<b style="opacity:0.9;">Validation & Minting</b><br>
• Deposits are verified by validator.<br>
• After successful verification, the equivalent amount will be minted to your StabiX account.<br>
• Processing time may vary depending on network confirmations it's usually takes few minutes.<br><br>

<b style="opacity:0.9;">Important Warnings</b><br>
• Always use the same wallet address (EOA) that was used to perform the deposit transaction.<br>
• Providing a different wallet address will result in failed minting and loss of credit.<br>
• Double-check transaction hash and amount before submission.<br>
• Do not send funds from exchanges or custodial wallets.<br><br>

<b style="opacity:0.9;">Non-Custodial Notice</b><br>
• Your funds remain on-chain and are never held in StabiX custody.<br>
• StabiX cannot access, control, or recover your funds.<br>
</div>
`;
}
// ================== PAGE 6 ==================//
window.openWithdraw = function(asset, network){
document.querySelector(".box").innerHTML = `
<!-- HEADER -->
<div style="display:flex;align-items:center;gap:10px;margin-bottom:15px;">
<div onclick="openWithdrawNetwork('${asset}')" style="
width:36px;
height:36px;
display:flex;
align-items:center;
justify-content:center;
border-radius:10px;
background:rgba(255,255,255,0.05);
cursor:pointer;
font-size:18px;
">←</div>
<div style="font-size:18px;font-weight:600;">
${asset} Withdraw
</div>
</div>
<!-- NETWORK SHOW -->
<div style="
background:#0b1220;
padding:12px;
border-radius:12px;
border:1px solid rgba(255,255,255,0.06);
margin-bottom:12px;">
<div style="font-size:12px;opacity:0.6;">Network</div>
<div style="font-size:14px;font-weight:600;">
${network}
</div>
</div>
<!-- VAULT ADDRESS -->
<div style="
background:#0b1220;
padding:12px;
border-radius:12px;
border:1px solid rgba(255,255,255,0.06);
margin-bottom:15px;">
<div style="font-size:12px;opacity:0.6;">Vault Address</div>
<div style="font-size:13px;color:#60a5fa;word-break:break-all;">
0xYOUR_VAULT_ADDRESS
</div>
</div>
<!-- FORM -->
<div style="
background:#0b1220;
padding:14px;
border-radius:14px;
border:1px solid rgba(255,255,255,0.06);">
<div style="font-size:12px;opacity:0.6;margin-bottom:6px;">
Recipient Address
</div>
<input id="eoa" placeholder="Enter wallet address" style="width:100%;margin-bottom:12px;">
<div style="font-size:12px;opacity:0.6;margin-bottom:6px;">
Amount
</div>
<input id="amount" placeholder="Enter amount" style="width:100%;margin-bottom:15px;">
<button onclick="submitWithdrawFinal('${asset}','${network}')" style="
width:100%;
padding:14px;
border-radius:12px;
background:#ef4444;
color:white;
font-weight:600;">
Submit Withdraw
</button>
</div>
`;
}

function networkCardWithdraw(asset, name, type, speed, fee){
return `
<div onclick="selectWithdrawNetwork('${asset}','${name} ${type}')"
style="
padding:14px;
border-radius:14px;
background:#0b1220;
border:1px solid rgba(255,255,255,0.06);
cursor:pointer;">
<div style="font-weight:600;font-size:15px;">
${name}
<span style="opacity:0.5;font-size:12px;"> ${type}</span>
</div>
<div style="font-size:12px;opacity:0.6;margin-top:6px;">
Speed: ${speed}
</div>
<div style="font-size:12px;opacity:0.6;">
Fee: ${fee}
</div>
</div>
`;
}
  
window.openWithdrawNetwork = function(asset){
document.querySelector(".box").innerHTML = `
<div style="display:flex;align-items:center;gap:10px;margin-bottom:15px;">
<div onclick="openAssetPage('${asset}')" style="
width:36px;height:36px;
display:flex;align-items:center;justify-content:center;
border-radius:10px;
background:rgba(255,255,255,0.05);
cursor:pointer;
font-size:18px;
">←</div>
<div style="font-size:18px;font-weight:600;">
Select Network
</div>
</div>
<div style="display:flex;flex-direction:column;gap:12px;">
${networkCardWithdraw(asset,"Ethereum","ERC20","~2 min","$5")}
${networkCardWithdraw(asset,"Arbitrum","L2","~10 sec","Low")}
${networkCardWithdraw(asset,"Polygon","PoS","~5 sec","Very low")}
${networkCardWithdraw(asset,"Base","L2","~5 sec","Low")}
</div>
`;
};
window.selectWithdrawNetwork = function(asset, network){
const vault = VAULTS[network] || "Not available";
document.querySelector(".box").innerHTML = `
<!-- HEADER -->
<div style="display:flex;align-items:center;gap:10px;margin-bottom:15px;">
<div onclick="openWithdrawNetwork('${asset}')" style="
width:36px;height:36px;
display:flex;align-items:center;justify-content:center;
border-radius:10px;
background:rgba(255,255,255,0.05);
cursor:pointer;
font-size:18px;
">←</div>
<div style="font-size:18px;font-weight:600;">
${asset} Withdraw
</div>
</div>
<!-- NETWORK -->
<div style="
background:#0b1220;
padding:12px;
border-radius:12px;
border:1px solid rgba(255,255,255,0.06);
margin-bottom:10px;">
<div style="font-size:12px;opacity:0.6;">Network</div>
<div>${network}</div>
</div>
<!-- VAULT -->
<div style="
background:#0b1220;
padding:12px;
border-radius:12px;
border:1px solid rgba(255,255,255,0.06);
margin-bottom:15px;">
<div style="font-size:12px;opacity:0.6;">Vault Address</div>
<a href="${EXPLORERS[network]}${vault}" target="_blank" style="
font-size:13px;
color:#60a5fa;
word-break:break-all;
text-decoration:none;">
${vault}
</a>
</div>
<!-- INPUT -->
<input id="eoa" placeholder="Recipient Address" style="width:100%;margin-bottom:10px;">
<input id="amount" placeholder="Amount" style="width:100%;margin-bottom:15px;">
<!-- SUBMIT -->
<button onclick="submitWithdrawFinal('${asset}','${network}')" style="
width:100%;
padding:14px;
border-radius:12px;
background:#ef4444;
color:white;
font-weight:600;
">
Submit Withdraw
</button>
<div style="
margin-top:15px;
margin-bottom:100px;
background:#0b1220;
padding:12px;
border-radius:12px;
border:1px solid rgba(255,255,255,0.06);
font-size:12px;
opacity:0.75;
line-height:1.6;
">
<b style="opacity:0.95;font-size:16px;font-weight:700;">
⚠️Read Before Withdrawal⚠️
 </b><br><br>
 <b style="opacity:0.9;">Withdrawal Instructions</b><br>
  • Funds will be withdrawn only to the recipient address (EOA) provided above.<br>
  • Ensure the selected network matches your destination wallet. Network mismatch will result in permanent loss of funds.<br>
  • Withdrawals are non-custodial. StabiX does not directly transfer funds to your wallet.<br><br>
  <b style="opacity:0.9;">Merkle-Based Withdrawal Process</b><br>
  • After validator submission, a Merkle Root is published and you will receive your unique Leaf via notification.<br>
  • Using this Leaf, you must manually claim your funds from the vault smart contract.<br>
  • Only the holder of the correct private key can execute the withdrawal. StabiX cannot access or control your funds.<br><br>
  <b style="opacity:0.9;">Time & Execution Window</b><br>
  • Withdrawal window is strictly limited to <b>20 hours</b> after Merkle Root publication.<br>
  • Merkle Root is generated daily at <b>16:30 UTC</b>.<br>
  • If not claimed within the valid window, your Leaf will expire and become invalid.<br><br>
  <b style="opacity:0.9;">Important Warnings</b><br>
  • After submitting a withdrawal request, the equivalent balance will be burn from your StabiX account.<br>
  • You must complete the on-chain withdrawal process after receiving your Leaf. Failure to do so will result in permanent loss.<br>
  • StabiX is not responsible for unclaimed, expired, or incorrectly executed withdrawals.<br>
  • Never share your private key, seed phrase, or wallet credentials with anyone.<br>
 </div> 
  `;
  }
   
// ================== SUBMIT DEPOSIT ==================//
window.submitDepositFinal = async function(asset, network){
const amount = document.getElementById("amount").value;
const txHash = document.getElementById("txHash").value;
const eoa = document.getElementById("eoa").value;
if(!amount || !txHash || !eoa){
alert("Fill all fields");
return;}
await addDoc(collection(db, "requests"), {
userId: WALLET,
type: "deposit",
asset,
network,
amount: Number(amount),
txHash,
eoa,
status: "pending",
createdAt: serverTimestamp()
});
await updateDoc(userRef, {
pendingRequest: true
});
alert("Deposit request sent");
goDeposit();
}

// ================== SUBMIT WITHDRAW ==================//
window.submitWithdrawFinal = async function(asset, network){
const amount = document.getElementById("amount").value;
const eoa = document.getElementById("eoa").value;
if(!amount || !eoa){
alert("Fill all fields");
return;}
await addDoc(collection(db, "requests"), {
userId: WALLET,
type: "withdraw",
asset,
network,
amount: Number(amount),
eoa,
status: "pending",
createdAt: serverTimestamp()
});
await updateDoc(userRef, {
pendingRequest: true
});
alert("Withdraw request submitted. Batching in progress. You will receive Merkle proof soon.");
goDeposit();
};




 /* ================= VALIDATOR PANEL ================= */
function validatorPanel(){
return `
<hr>
<h3>Validator Panel</h3>
<input id="vUser" placeholder="Target User ID (TG_xxx)">
<select id="vAsset">
<option value="USDC">USDC</option>
<option value="USDT">USDT</option>
</select>

<input id="vEOA" placeholder="Wallet Address (0x...)" style="
width:100%;
margin-top:8px;
padding:10px;
border-radius:8px;
border:1px solid #1e293b;
background:#020617;
color:#e5e7eb;
">

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
