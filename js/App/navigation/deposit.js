/*========Deposit Nav======[*/
window.goDeposit = async () => {
const response = await fetch(
  `http://10.148.199.19:3000/api/users/profile/${window.getCurrentUserId()}`,
  {
    headers: {
      Authorization: `Bearer ${window.getToken()}`
    }
  }
);

const data = await response.json();

if (!response.ok) {
  alert(data.message);
  return;
}

const user = data.user;
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
${window.userData?.usdtBalance?.toFixed(2) || "0.00"}
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
${window.userData?.balance?.toFixed(2) || "0.00"}</div>
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

  const response = await fetch(
    `http://10.148.199.19:3000/api/transactions/history/${window.getCurrentUserId()}`,
    {
      headers: {
        Authorization: `Bearer ${window.getToken()}`
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    document.getElementById("recentTxs").innerHTML =
      `<div style="opacity:.5;">Unable to load activity</div>`;
    return;
  }

  let arr = (data.transactions || []).filter(t =>
    t.type === "deposit" ||
    t.type === "withdraw"
  );

  arr.sort(
    (a, b) =>
      new Date(b.created_at) -
      new Date(a.created_at)
  );

  arr = arr.slice(0, 5);

  let html = "";

  arr.forEach(t => {

    const isDeposit = t.type === "deposit";

    const time = new Date(
      t.created_at
    ).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });

    html += `
<div style="
display:flex;
justify-content:space-between;
padding:10px 0;
border-bottom:1px solid var(--border);">

  <div style="font-size:13px;">

    <div>
      ${isDeposit ? "Deposit" : "Withdraw"}
    </div>

    <div style="
    font-size:11px;
    opacity:.6;">
      ${time}
    </div>

  </div>

  <div style="
  font-weight:600;
  color:${isDeposit
    ? "var(--success)"
    : "var(--danger)"};">

    ${isDeposit ? "+" : "-"}
    ${Number(t.amount).toFixed(2)}
    ${t.asset}

  </div>

</div>
`;
  });

  document.getElementById("recentTxs").innerHTML =
    html ||
    `<div style="opacity:.5;">No recent D/W</div>`;

})();
selectTab("deposit");
};

window.selectDWAsset = (asset) => {
window.selectedDWAsset = asset;
document.getElementById("dwAssets").style.display = "none";
document.getElementById("actionScreen").style.display = "block";
document.getElementById("selectedAssetText").innerText = asset;
};
