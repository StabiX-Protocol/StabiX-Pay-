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

