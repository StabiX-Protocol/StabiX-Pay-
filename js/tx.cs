/* ================= SEND USDC ================= */
window.sendUSDC = async ()=>{

const toWallet = sendTo.value.trim();
const amount = Number(sendAmt.value);

if(!toWallet || amount<=0) return alert("Invalid input");

let failed = false;

try{

document.getElementById("sendPopup")?.remove();

await runTransaction(db, async(tx)=>{

const fromSnap = await tx.get(userRef);
const toRef = doc(db,"users",toWallet);
const toSnap = await tx.get(toRef);

if(!toSnap.exists()) throw "Receiver not found";

if(fromSnap.data().balance < amount){

showTxPopup("Insufficient Balance","failed");

failed = true;

return;

}

tx.update(userRef,{ balance: fromSnap.data().balance - amount });
tx.update(toRef,{ balance: toSnap.data().balance + amount });

tx.set(doc(collection(db,"transactions")),{
userId: WALLET,
type:"sent",
amount,
counterparty:toWallet,
createdAt:serverTimestamp()
});

tx.set(doc(collection(db,"transactions")),{
userId: toWallet,
type:"received",
amount,
counterparty:WALLET,
createdAt:serverTimestamp()
});

});

if(!failed){

showTxPopup(`Sent ${amount} USDC to ${toWallet}`,"success");

renderApp();

}

}catch(e){

if(e!=="Receiver not found") console.log(e);

}

};
  
  window.openScanner = ()=>{

tg.showPopup({
title:"Scanner",
message:"QR Scanner coming soon",
buttons:[{type:"ok"}]
})

    }
