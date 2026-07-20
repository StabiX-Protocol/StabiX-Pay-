/*========Deposit Nav======[*/
window.goDeposit = async () => {
const snap = await getDoc(userRef);
const user = snap.data();
document.querySelector(".box").innerHTML = `
<h2>Select Asset</h2>
<div style="display:flex;flex-direction:column;gap:12px;margin-top:15px;">

<div onclick="selectDWAsset('USDT')" style="
background:var(--surface);
border:1px solid var(--border);
border-radius:12px;
padding:14px;
display:flex;
justify-content:space-between;
align-items:center;
cursor:pointer;">
<div style="display:flex;align-items:center;gap:10px;">
<img src="./media/tether-usdt-logo.png" style="width:32px;height:32px;border-radius:50%;">
<div>USDT</div>
</div>
<div style="font-weight:bold">
${user.usdtBalance?.toFixed(2) || "0.00"}
</div>
</div>

<div onclick="selectDWAsset('USDC')" style="
background:var(--surface);
border:1px solid var(--border);
border-radius:12px;
padding:14px;
display:flex;
justify-content:space-between;
align-items:center;
cursor:pointer;">
<div style="display:flex;align-items:center;gap:10px;">
<img src="./media/usd-coin-usdc-logo.png" style="width:32px;height:32px;border-radius:50%;">
<div>USDC</div>
</div>
<div style="font-weight:bold">
${user.balance?.toFixed(2) || "0.00"}
</div>
</div>

<div style="margin-top:25px;">
<div style="
font-weight:600;
font-size:14px;
opacity:0.8;
margin-bottom:10px;">
Recent Activity
</div>
<div id="recentTxs"></div> 
</div>
`;

  (async () => {
const q = query(
collection(db, "transactions"),
where("userId", "==", WALLET));
const snap = await getDocs(q);
let arr = [];
snap.forEach(d => {
const t = d.data();
if(t.type === "deposit" || t.type === "withdraw"){
arr.push({...t,_time: t.createdAt?.seconds || 0});
}
});
arr.sort((a,b)=> b._time - a._time);
arr = arr.slice(0,5);
let html = "";
arr.forEach(t => {
const isDeposit = t.type === "deposit";
const time = t.createdAt
? new Date(t.createdAt.seconds * 1000).toLocaleString("en-IN", {
day: "2-digit",
month: "short",
hour: "2-digit",
minute: "2-digit"
})
: "";
html += `
<div style="
display:flex;
justify-content:space-between;
padding:10px 0;
border-bottom:1px solid var(--border);">
<div style="font-size:13px;">
<div>${isDeposit ? "Deposit" : "Withdraw"}</div>
<div style="font-size:11px;opacity:0.6;">${time}</div>
</div>
<div style="
font-weight:600;
color:${isDeposit ? "var(--success)" : "var(--danger)"};">
${isDeposit ? "+" : "-"} ${t.amount} ${t.asset || ""}
</div>
</div>
`;
});
document.getElementById("recentTxs").innerHTML =
html || `<div style="opacity:0.5;">No recent D/W</div>`;
})(); 
selectTab("deposit");
};

window.selectDWAsset = (asset) => {
window.selectedDWAsset = asset;
document.getElementById("dwAssets").style.display = "none";
document.getElementById("actionScreen").style.display = "block";
document.getElementById("selectedAssetText").innerText = asset;
};
