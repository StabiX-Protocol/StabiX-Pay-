// ==================Deposit Withdraw Logic==================//
window.isValidAddress = function(addr, network){
if(!addr) return false;
// EVM 
if(network.includes("Ethereum") || 
network.includes("Arbitrum") || 
network.includes("Polygon") || 
network.includes("Base")){
return /^0x[a-fA-F0-9]{40}$/.test(addr);
}
// Non-EVM TRON (TRC20)
if(network.includes("Tron")){
return /^T[a-zA-Z0-9]{33}$/.test(addr);
}
return false;
};

window.selectDWAsset = (asset) => {
if (!["USDT", "USDC"].includes(asset)) {
alert("Unsupported asset");
return;
}
window.MODE = null;
window.selectedDWAsset = asset;
document.querySelector(".box").innerHTML = `
<div style="
display:flex;
flex-direction:column;
align-items:center;
margin-top:20px;
gap:10px;
">
<img 
src="${asset === 'USDT' 
? './media/tether-usdt-logo.png' 
: './media/usd-coin-usdc-logo.png'}"
style="
width:60px;
height:60px;
border-radius:50%;
">
<div style="
font-size:20px;
font-weight:bold;
">
${asset}
</div>
</div>

<div style="margin-bottom:20px;">
<div style="
font-size:13px;
opacity:0.6;
margin-bottom:12px;
">
Select Mode
</div>

<!-- Instant -->
<div id="instantBtn" onclick="selectMode('instant')" style="
padding:16px;
border-radius:16px;
border:1px solid var(--border);
margin-bottom:14px;
cursor:pointer;
">
<div style="display:flex; align-items:center; gap:10px;">
<div style="font-size:16px;">Instant</div>
<div style="font-size:11px; opacity:0.45;">(Recommended)</div>
</div>
</div>

<!-- Advanced -->
<div id="advancedBtn" onclick="selectMode('advanced')" style="
padding:16px;
border-radius:16px;
border:1px solid var(--border);
cursor:pointer;
">
<div style="display:flex; align-items:center; gap:10px;">
<div style="font-size:16px;">Advanced</div>
<div style="font-size:11px; opacity:0.45;">(Self Custody)</div>
</div>
</div>
</div>
  
<div style="display:flex; gap:12px; margin-top:30px;">
<button onclick="handleDepositClick('${asset}')" style="
flex:1;
padding:14px;
border-radius:12px;
background:var(--success);
color:var(--bg);
font-weight:bold;
">
Deposit
</button>

<button onclick="handleWithdrawClick('${asset}')" style="
flex:1;
padding:14px;
border-radius:12px;
background:var(--danger);
color:var(--text);
font-weight:bold;
">
Withdraw
</button>
</div>

<div style="
margin-top:25px;
background:var(--surface);
border:1px solid var(--border);
border-radius:14px;
padding:14px;
">
<div style="
font-size:14px;
font-weight:600;
margin-bottom:10px;
opacity:0.9;
">
Asset Selected
</div>
<ul style="
font-size:12px;
opacity:0.7;
line-height:1.6;
padding-left:16px;
">
<li>You have selected <b>${asset}</b> for your transaction.</li>
<li>All deposits and withdrawals initiated from this page will be processed in <b>${asset}</b> only.</li>
<li>Please ensure you choose the correct network in the next step before proceeding.</li>
<li>Sending or requesting unsupported assets may result in permanent loss.</li>
<li>Review all transaction details carefully before submission.</li>
</ul>
</div>
<div onclick="goDeposit()" style="
position:absolute;
top:20px;
left:20px;
width:40px;
height:40px;
display:flex;
align-items:center;
justify-content:center;
border-radius:10px;
background:var(--surface);
backdrop-filter:blur(6px);
font-size:22px;
cursor:pointer;
">
←
</div>
`;
};

window.openAssetPage = function(asset){
window.selectedDWAsset = asset;
selectDWAsset(asset);
}

