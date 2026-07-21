window.approveReq = async (reqId)=>{
const reqRef = doc(db,"requests",reqId);
let reqData;
let assetType;
await runTransaction(db, async(tx)=>{
const reqSnap = await tx.get(reqRef);
if(!reqSnap.exists()) throw "Request not found";
const r = reqSnap.data();
reqData = r;
const userRefX = doc(db,"users",r.userId);
const userSnap = await tx.get(userRefX);
if(!userSnap.exists()) throw "User not found";
const asset = r.asset || "USDC";
assetType = asset;
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
pendingRequest:false,
needsRefresh:true
});
}else{
tx.update(userRefX,{
usdtBalance: bal,
pendingRequest:false,
needsRefresh:true
});
}
tx.update(reqRef,{
status:"approved"
});
tx.set(doc(collection(db,"transactions")),{
userId: r.userId,
type: r.type,
mode: r.mode || "instant",
amount: r.amount,
str: r.str,
asset: asset,
counterparty: null,
eoa: r.eoa || null,
createdAt: serverTimestamp()
});
});
await updateLiveFeed({
str: reqData.str,
amount: reqData.amount,
asset: assetType
});
alert("Request approved");
loadRequests();
};
