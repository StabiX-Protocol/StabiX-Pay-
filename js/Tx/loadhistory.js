/* ================= HISTORY ================= */
window.loadHistory = async function() {
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
where("createdAt", "<=", end),
orderBy("createdAt", "desc")
);
const snap = await getDocs(q);
renderHistoryFromSnap(snap, "No transactions for this date");
};
