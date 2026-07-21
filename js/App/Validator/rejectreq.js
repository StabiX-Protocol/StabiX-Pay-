window.rejectReq = async (reqId)=>{
const reqRef = doc(db,"requests",reqId);
const snap = await getDoc(reqRef);
await updateDoc(doc(db,"users", snap.data().userId),{
pendingRequest:false,
needsRefresh:true
});
await updateDoc(reqRef,{ status:"rejected" });
alert("Rejected");
loadRequests();
renderApp();
};
