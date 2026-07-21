window.validatorAdjust = async ()=>{
const userId = document.getElementById("vUser").value.trim()
const type = document.getElementById("vType").value
const amount = Number(document.getElementById("vAmount").value)
const asset = document.getElementById("vAsset").value
const eoa = document.getElementById("vEOA").value.trim();
if(!userId || !amount){
alert("Invalid input")
return
}
if((type === "deposit" || type === "withdraw") && !eoa){
alert("EOA required")
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
await addDoc(collection(db,"transactions"),{
userId: userId,
type: type, 
mode: "manual",
amount: amount,
asset: asset,
counterparty: null,
eoa: eoa,
createdAt: new Date()
});
await updateLiveFeed({
str: "MANUAL",
amount,
asset
});
alert(asset + " updated")
}
