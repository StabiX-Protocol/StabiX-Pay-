window.openInstantWithdraw = function(asset){
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
${instantWithdrawNetworkCard(asset,"Ethereum","(Testnet)","eth.png")}
${instantWithdrawNetworkCard(asset,"Arbitrum","(Testnet)","arb.png")}
${instantWithdrawNetworkCard(asset,"Polygon","(Testnet)","polygon.png")}
${instantWithdrawNetworkCard(asset,"Base","(Testnet)","base.png")}
</div>
`;
};

function instantWithdrawNetworkCard(asset, name, type, speed, fee){
return `
<div onclick="selectInstantWithdraw('${asset}', '${name} ${type}')" style="
padding:14px;
border-radius:14px;
background:var(--surface);
border:1px solid var(--border);
cursor:pointer;
">
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
