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
const str = await generateSTR();
window.currentSTR = str;
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
str: str,
createdAt:serverTimestamp()
});
tx.set(doc(collection(db,"transactions")),{
userId: toWallet,
type:"received",
amount,
asset,
counterparty:WALLET,
str: str,
createdAt:serverTimestamp()
});
});
if(!failed){
if(window.isSender){
showTxPopup(`Sent ${amount} ${asset} to ${toWallet}`, "success");
} 
await updateLiveFeed({
str: window.currentSTR,
amount,
asset
});
renderApp();
window.isSender = false;
}
}catch(e){
if(e!=="Receiver not found") console.log(e);
}
};
