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
// Ethereum tx hash validation
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
walletAddress:"",
txHash: txHash,
status:"pending",
createdAt: serverTimestamp()
})

await updateDoc(userRef,{ pendingRequest:true })

alert("Deposit request sent to validator")

renderApp()

  }
  
