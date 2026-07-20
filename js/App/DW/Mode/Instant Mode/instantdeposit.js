window.openInstantDeposit = function(asset){
document.querySelector(".box").innerHTML = `
<div style="display:flex;align-items:center;gap:10px;margin-bottom:15px;">
<div onclick="openAssetPage('${asset}')" style="
width:36px;
height:36px;
display:flex;
align-items:center;
justify-content:center;
border-radius:10px;
background:var(--surface);
cursor:pointer;
font-size:18px;
">←</div>
<div style="font-size:18px;font-weight:600;">
Select Network
</div>
</div>

<div style="display:flex;flex-direction:column;gap:12px;">
${networkCard(asset,"Ethereum","Sepolia","~2 min","$5 fee")}
${networkCard(asset,"Arbitrum","Sepolia","~10 sec","Low fee")}
${networkCard(asset,"Polygon","Amoy","~5 sec","Very low")}
${networkCard(asset,"Base","Sepolia","~5 sec","Low fee")}
</div>
`;
};

function instantNetworkCard(asset, name, type, speed, fee){
return `
<div onclick="selectInstantNetwork('${asset}','${name} ${type}')"
style="
padding:14px;
border-radius:14px;
background:var(--surface);
border:1px solid var(--border);
cursor:pointer;">
<div style="font-weight:600;font-size:15px;">
${name}
<span style="opacity:0.5;font-size:12px;"> ${type}</span>
</div>

<div style="font-size:12px;opacity:0.6;margin-top:6px;">
Speed: ${speed}
</div>

<div style="font-size:12px;opacity:0.6;">
Fee: ${fee}
</div>
</div>
`;
}

window.selectInstantNetwork = function(asset, network){
const wallet = WALLETS[asset]?.[network] || "Not available";
document.querySelector(".box").innerHTML = `
<div style="display:flex;align-items:center;gap:10px;margin-bottom:15px;">
<div onclick="openInstantDeposit('${asset}')" style="
width:36px;
height:36px;
display:flex;
align-items:center;
justify-content:center;
border-radius:10px;
background:var(--surface);
cursor:pointer;
font-size:18px;
">←</div>

<div style="font-size:18px;font-weight:600;">
${asset} Deposit
</div>
</div>

<div style="
background:var(--surface);
padding:12px;
border-radius:12px;
border:1px solid var(--border);
margin-bottom:10px;">

<div style="font-size:12px;opacity:0.6;">Network</div>
<div>${network}</div>
</div>

<div style="
background:var(--surface);
padding:12px;
border-radius:12px;
border:1px solid var(--border);
margin-bottom:15px;">
<div style="font-size:12px;opacity:0.6;">Wallet Address</div>
<div style="margin-top:10px;display:flex;justify-content:center;">
<img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${wallet}" />
</div>

<div style="
margin-top:10px;
font-size:12px;
color:var(--primary);
white-space:nowrap;
overflow-x:auto;
line-height:1.4;
">
${wallet}
</div>

<button onclick="copyAddress('${wallet}')" style="
padding:6px 10px;
border:none;
border-radius:8px;
background:var(--primary);
color:var(--text);
font-size:11px;">
Copy
</button>
</div>
</div>

<input id="amount" type="number" inputmode="decimal" placeholder="Amount" style="width:100%;margin-bottom:10px;">
<input id="txHash" placeholder="Transaction Hash" style="width:100%;margin-bottom:10px;">
<input id="eoa" placeholder="Your Wallet Address" style="width:100%;margin-bottom:15px;">

<button onclick="submitInstantDeposit('${asset}','${network}')" style="
width:100%;
padding:14px;
border-radius:12px;
background:var(--success);
color:var(--bg);
font-weight:600;
">
Deposit
</button>
`;
};

window.copyAddress = function(addr){
navigator.clipboard.writeText(addr);
};
function isValidTxHash(hash){
return /^0x([A-Fa-f0-9]{64})$/.test(hash);
}
