/* ================= SEND USDC/USDT ================= */
window.sendUSDC = async ()=>{
const asset = window.primaryAsset;
window.isSender = true;
const input = document.getElementById("sendTo");
const toWallet = input ? input.value.trim() : "";
const amtInput = document.getElementById("sendAmt");
const amount = amtInput ? Number(amtInput.value) : 0;
if(!toWallet || amount<=0) return alert("Invalid Input");
if(toWallet === WALLET){
showTxPopup("Self Transfers Are Not Allowed","failed");
failed = true;
return;
}
let failed = false;
try{
document.getElementById("sendPopup")?.remove();
await runTransaction(db, async(tx)=>{
const fromSnap = await tx.get(userRef);
const toRef = doc(db,"users",toWallet);
const toSnap = await tx.get(toRef);
if(!toSnap.exists()){
showTxPopup("User Not Found","failed");
failed = true;
return;
}
const fromBalance = asset === "USDC"
? fromSnap.data().balance: fromSnap.data().usdtBalance || 0;
if(fromBalance < amount)
{
showTxPopup("Insufficient Balance","failed");
failed = true;
return;
}
if(asset === "USDC"){
tx.update(userRef,{ balance: fromBalance - amount });
tx.update(toRef,{ balance: (toSnap.data().balance || 0) + amount });
}else{
tx.update(userRef,{ usdtBalance: fromBalance - amount });
tx.update(toRef,{ usdtBalance: (toSnap.data().usdtBalance || 0) + amount });
}
tx.set(doc(collection(db,"transactions")),{
userId: WALLET,
type:"sent",
amount,
asset,
counterparty:toWallet,
createdAt:serverTimestamp()
});
tx.set(doc(collection(db,"transactions")),{
userId: toWallet,
type:"received",
amount,
asset,
counterparty:WALLET,
createdAt:serverTimestamp()
});
});
if(!failed){
await addDoc(collection(db, "notifications"), {
to: toWallet,
from: WALLET,
amount: Number(amount),
type: "receive",
time: serverTimestamp(),
read: false
});
if(window.isSender){
showTxPopup(`Sent ${amount} ${asset} to ${toWallet}`, "success");
}
renderApp();
window.isSender = false;
}
}catch(e){
if(e!=="Receiver not found") console.log(e);
}
};
  /*===============Deposit & Withdraw Logic======*/
window.openDeposit = ()=>{
const box = document.getElementById("depositBox")
if(box.style.display==="block"){
box.style.display="none"
}else{
box.style.display="block"
}
document.getElementById("withdrawBox").style.display="none"
}
window.openWithdraw = ()=>{
const box = document.getElementById("withdrawBox")
if(box.style.display==="block"){
box.style.display="none"
}else{
box.style.display="block"
}
document.getElementById("depositBox").style.display="none"
}

window.showVault = ()=>{
const net = document.getElementById("networkSelect").value
const vault = document.getElementById("vaultSection")
if(net==="sepolia"){
vault.style.display="block"
}else{
vault.style.display="none"
}
}

window.copyVault = ()=>{
navigator.clipboard.writeText("0x710c5D40a97123903b7cB482dBe39EB35D52af0a")
alert("Vault address copied")
}

window.showDepositForm = ()=>{
document.getElementById("depositForm").style.display="block"
}

window.submitDeposit = async ()=>{
const amount = depAmount.value.trim()
const txHash = depHash.value.trim()
if(!amount || Number(amount) <= 0){
alert("Enter valid amount")
return
}
if(!txHash.startsWith("0x") || txHash.length !== 66){
alert("Invalid Transaction Hash")
return
}
if(txHash.length !== 66){
alert("Invalid transaction hash")
return
}
await addDoc(collection(db,"requests"),{
userId: WALLET,
type:"deposit",
amount: Number(amount),
asset: window.primaryAsset,
walletAddress:"",
txHash: txHash,
status:"pending",
createdAt: serverTimestamp()
})
await updateDoc(userRef,{ pendingRequest:true })
alert("Deposit request sent to validator")
renderApp()
}
/* ================= HISTORY ================= */
async function loadHistory() {
const q = query(
collection(db, "transactions"),
where("userId", "==", WALLET)
);
const snap = await getDocs(q);
renderHistoryFromSnap(snap, "No transactions");
}

window.loadHistoryByDate = async () => {
const selected = document.getElementById("historyDate")?.value;
if (!selected) {
loadHistory(); 
return;
}
const startDate = new Date(selected);
startDate.setHours(0, 0, 0, 0);
const endDate = new Date(selected);
endDate.setHours(23, 59, 59, 999);
const start = Timestamp.fromDate(startDate);
const end = Timestamp.fromDate(endDate);
const q = query(
collection(db, "transactions"),
where("userId", "==", WALLET),
where("createdAt", ">=", start),
where("createdAt", "<=", end)
);
const snap = await getDocs(q);
renderHistoryFromSnap(snap, "No transactions for this date");
};
  
window.submitWithdraw = async ()=>{
const amount = Number(document.getElementById("wdAmount").value);
const snap = await getDoc(userRef);
const user = snap.data();
if(!user.eoaAddress){
alert("Please register EOA wallet first");
return;
}
if(!amount || amount <= 0){
alert("Enter valid amount");
return;
}
if(user.pendingRequest){
alert("Account frozen. Pending request under review.");
return;
}
if(amount > user.balance){
alert("Insufficient balance");
return;
}
await addDoc(collection(db,"requests"),{
userId: WALLET,
type:"withdraw",
amount: amount,
asset: window.primaryAsset,
walletAddress: user.eoaAddress,
txHash:"",
status:"pending",
createdAt: serverTimestamp()
});
await updateDoc(userRef,{ pendingRequest:true });
tg.showPopup({
title:"Request Submitted",
message:"Wait for Validator Verification",
buttons:[{type:"ok"}]
});
renderApp();
};
/* ================= HISTORY RENDER ================= */
function renderHistoryFromSnap(snap, emptyText) {
let html = "";
snap.forEach(d => {
const t = d.data();
const isDepositWithdraw =
t.type === "deposit" || t.type === "withdraw";
const isCredit = isDepositWithdraw
? t.type === "deposit"
: t.type === "received";
const sign = isCredit ? "+" : "-";
const color = isCredit ? "#22c55e" : "#ef4444";
const metaLine = isDepositWithdraw
? t.type.toUpperCase()
: (isCredit? `${t.counterparty} → ${WALLET}`: `${WALLET} → ${t.counterparty}`);

html += `
<div class="tx" style="color:${color}">
<b>${sign}${t.amount} ${t.asset || "USDC"}</b><br>
<span class="small">
${metaLine}<br>
${t.createdAt?.toDate()?.toLocaleString() || ""}
</span>
</div>
`;
});
document.getElementById("history").innerHTML =
html || `<span class="small">${emptyText}</span>`;
}

window.validatorAdjust = async ()=>{
const userId = document.getElementById("vUser").value.trim()
const type = document.getElementById("vType").value
const amount = Number(document.getElementById("vAmount").value)
const asset = document.getElementById("vAsset").value
if(!userId || !amount){
alert("Invalid input")
return
}
const ref = doc(db,"users",userId)
const snap = await getDoc(ref)
if(!snap.exists()){
alert("User not found")
return
}
const data = snap.data()
let balance = 0
if(asset === "USDC"){
balance = data.balance || 0
}else{
balance = data.usdtBalance || 0
}
if(type === "deposit"){
balance += amount
}else{
if(balance < amount){
alert("Insufficient balance")
return
}
balance -= amount
}
if(asset === "USDC"){
await updateDoc(ref,{
balance: balance
})
}else{
await updateDoc(ref,{
usdtBalance: balance
})
}
alert(asset + " updated")
}

window.loadRequests = async ()=>{
const q = query(
collection(db,"requests"),
where("status","==","pending")
);
const snap = await getDocs(q);
let html = "";
snap.forEach(d=>{
const r = d.data();
const time = r.createdAt? r.createdAt.toDate().toLocaleString(): "";

html += `
<div class="tx">
<b>${r.type.toUpperCase()} ${r.amount} ${r.asset || "USDC"}</b>
<span class="small">
User ID: ${r.userId}<br>
Wallet: ${r.walletAddress}<br>
${r.txHash ? `Tx Hash: ${r.txHash}<br>` : ""}
Time: ${time}
</span>
<br><br>
<button onclick="approveReq('${d.id}')">Approve</button>
<button onclick="rejectReq('${d.id}')">Reject</button>
</div>
`;
});
document.getElementById("vout").innerHTML =
html || "<span class='small'>No pending requests</span>";
};


window.loadAllUsers = async ()=>{
const listDiv = document.getElementById("userList");
const countDiv = document.getElementById("userCount");
listDiv.innerHTML = "Loading...";
countDiv.innerHTML = "";
try{
const snap = await getDocs(collection(db,"users"));
countDiv.innerHTML = `Total Users: <b>${snap.size}</b>`;
let html = "";
snap.forEach(d=>{
const u = d.data();
const username = u.username ? u.username : "No username";
const tgWallet = u.walletAddress ? u.walletAddress : d.id;
const eoa = u.eoaAddress ? u.eoaAddress : "Not added";
  
html += `
<div class="tx">
<b>${username}</b><br>
<span class="small">
TG: ${tgWallet}
</span><br>
<span class="small">
EOA: ${eoa}
</span>
</div>
`;
});

listDiv.innerHTML =
html || "<span class='small'>No users found</span>";
}catch(e){
listDiv.innerHTML =
"<span class='small'>Error loading users</span>";
}
};

window.approveReq = async (reqId)=>{
const reqRef = doc(db,"requests",reqId);
await runTransaction(db, async(tx)=>{
const reqSnap = await tx.get(reqRef);
if(!reqSnap.exists()) throw "Request not found";
const r = reqSnap.data();
const userRefX = doc(db,"users",r.userId);
const userSnap = await tx.get(userRefX);
if(!userSnap.exists()) throw "User not found";
const asset = r.asset || "USDC";
let bal = 0;
if(asset === "USDC"){
bal = userSnap.data().balance || 0;
}else{
bal = userSnap.data().usdtBalance || 0;
}
if(r.type === "deposit"){
bal = bal + r.amount;
}
if(r.type === "withdraw"){
if(bal < r.amount) throw "Insufficient balance";
bal = bal - r.amount;
}
if(asset === "USDC"){
tx.update(userRefX,{
balance: bal,
pendingRequest:false
});
}else{
tx.update(userRefX,{
usdtBalance: bal,
pendingRequest:false
});
}
tx.update(reqRef,{
status:"approved"
});
tx.set(doc(collection(db,"transactions")),{
userId: r.userId,
type: r.type,
amount: r.amount,
asset: asset,
counterparty:"VALIDATOR",
createdAt: serverTimestamp()
});
});
alert("Request approved");
loadRequests();
};

window.rejectReq = async (reqId)=>{
const reqRef = doc(db,"requests",reqId);
const snap = await getDoc(reqRef);
await updateDoc(doc(db,"users", snap.data().userId),{
pendingRequest:false  
});
await updateDoc(reqRef,{ status:"rejected" });
alert("Rejected");
loadRequests();
renderApp();
};

window.checkUserBalance = async ()=>{
const userId = document.getElementById("vUser").value.trim()
const asset = document.getElementById("vAsset").value
if(!userId){
alert("Enter user ID")
return
}
const snap = await getDoc(doc(db,"users",userId))
if(!snap.exists()){
alert("User not found")
return
}
const data = snap.data()
let balance = 0
if(asset === "USDC"){
balance = data.balance || 0
}else{
balance = data.usdtBalance || 0
}
document.getElementById("balanceOut").innerText =
asset + " Balance: " + balance
}


window.showTxPopup = (msg,type="success")=>{
if(!window.isSender) return;
const popup = document.getElementById("txPopup")
const title = document.getElementById("txTitle")
const msgBox = document.getElementById("txMsg")
const tick = document.getElementById("tick")
const cross1 = document.getElementById("crossLine1")
const cross2 = document.getElementById("crossLine2")
const ring = document.querySelector(".circle-progress")
const done = document.getElementById("txDoneBtn")
popup.style.display="flex"
msgBox.innerText = msg
done.style.display="none"
const timeBox = document.getElementById("txTime")
if(type==="success"){
const now = new Date()
timeBox.innerText = now.toLocaleString()
}else{
timeBox.innerText=""
}
tick.style.display="none"
cross1.style.display="none"
cross2.style.display="none"
ring.style.animation="none"
ring.offsetHeight
ring.style.animation="progressFill .9s ease forwards"
tick.style.animation="none"
cross1.style.animation="none"
cross2.style.animation="none"
tick.offsetHeight
cross1.offsetHeight
cross2.offsetHeight
  
if(type==="failed"){
title.innerText="Transaction Failed"
title.style.color="#ef4444"
ring.style.stroke="#ef4444"
done.style.background="#ef4444"
done.style.color="white"
cross1.style.display="block"
cross2.style.display="block"
cross1.style.animation="tickDraw .35s ease forwards"
cross2.style.animation="tickDraw .35s ease forwards"
}
  
else{
title.innerText="Transaction Successful"
title.style.color="#22c55e"
ring.style.stroke="#22c55e"
done.style.background="#22c55e"
done.style.color="#022c22"
tick.style.display="block"
tick.style.animation="tickDraw .35s ease forwards"
}
setTimeout(()=>{
done.style.display="block"
},900)
}
