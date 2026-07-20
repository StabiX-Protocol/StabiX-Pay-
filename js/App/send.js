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
const stbxPattern = /^STBX\d{10}$/;
if (!stbxPattern.test(toWallet)) {
alert("Enter valid StabiX UID (example: STBX123456789)")
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

const amt = document.getElementById("sendAmt");
amt.addEventListener("input", function () {
let v = this.value.replace(/[^0-9.]/g, "");
if (v.startsWith(".")) v = "0" + v;
const parts = v.split(".");
if (parts.length > 2) {
v = parts[0] + "." + parts.slice(1).join("");
}
if (!v.includes(".")) {
v = String(Number(v || 0));
if (v === "NaN") v = "";
}
this.value = v;
});

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

