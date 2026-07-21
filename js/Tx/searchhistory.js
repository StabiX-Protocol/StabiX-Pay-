window.setupHistorySearch = ()=>{
const input = document.getElementById("searchInput");
if(!input) return;
input.addEventListener("input", async (e)=>{
const val = e.target.value.trim();
if(!val){
loadHistory();
return;
}
const q = query(
collection(db, "transactions"),
where("userId", "==", WALLET)
);
const snap = await getDocs(q);
let filtered = [];
snap.forEach(docSnap=>{
const t = docSnap.data();
if(
t.counterparty?.toLowerCase().includes(val.toLowerCase())
){
filtered.push({ ...t, id: docSnap.id });
}
});
renderHistoryFromSnap({
forEach: (cb)=> filtered.forEach(d=> cb({data:()=>d,id:d.id}))
}, "No results");
});
};
