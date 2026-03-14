/* ================= USERNAME CHANGE (30 DAYS) ================= */
window.changeUsername = async ()=>{
  const snap = await getDoc(userRef);
  const last = snap.data().lastUsernameChange?.toDate();
  if(last && ((Date.now()-last)/(1000*60*60*24)) < 30)
    return alert("Username can be changed once every 30 days");

  const name = prompt("New username");
  if(!name?.trim()) return;
  await updateDoc(userRef,{ username:name.trim(), lastUsernameChange:serverTimestamp() });
  renderApp();
};
