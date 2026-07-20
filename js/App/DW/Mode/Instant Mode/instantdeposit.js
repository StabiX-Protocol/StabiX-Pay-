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
