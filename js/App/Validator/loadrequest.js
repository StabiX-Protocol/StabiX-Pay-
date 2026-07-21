window.loadRequests = async ()=>{
const q = query(
collection(db,"requests"),
where("status","==","pending")
);
const snap = await getDocs(q);
let html = "";
snap.forEach(d=>{
const r = d.data();
const time = r.createdAt? r.createdAt.toDate().toLocaleString(): "";

html += `
<div class="tx">
<b>${r.type.toUpperCase()} ${r.amount} ${r.asset || "USDC"}</b>
<span class="small">
User ID: ${r.userId}<br>
Wallet: ${r.wallet || r.eoa || "N/A"}<br>
Network: ${r.network || "N/A"}<br>
Mode: ${r.mode || "advanced"}<br>
STR: ${r.str || "N/A"}<br>
${r.txHash ? `Tx Hash: ${r.txHash}<br>` : ""}
Time: ${time}
</span>
<br><br>
<button onclick="approveReq('${d.id}')">Approve</button>
<button onclick="rejectReq('${d.id}')">Reject</button>
</div>
`;
});
document.getElementById("vout").innerHTML =
html || "<span class='small'>No pending requests</span>";
};

