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


