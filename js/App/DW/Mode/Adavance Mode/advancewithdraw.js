// ================== Advance Mode (Withdraw Flow)==================//
window.openWithdraw = function(asset, network){
document.querySelector(".box").innerHTML = `
<!-- HEADER -->
<div style="display:flex;align-items:center;gap:10px;margin-bottom:15px;">
<div onclick="openWithdrawNetwork('${asset}')" style="
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
${asset} Withdraw
</div>
</div>
<!-- NETWORK SHOW -->
<div style="
background:var(--surface);
padding:12px;
border-radius:12px;
border:1px solid var(--border);
margin-bottom:12px;">
<div style="font-size:12px;opacity:0.6;">Network</div>
<div style="font-size:14px;font-weight:600;">
${network}
</div>
</div>
<!-- VAULT ADDRESS -->
<div style="
background:#0b1220;
padding:12px;
border-radius:12px;
border:1px solid var(--border);
margin-bottom:15px;">
<div style="font-size:12px;opacity:0.6;">Vault Address</div>
<div style="font-size:13px;color:var(--primary);word-break:break-all;">
0xYOUR_VAULT_ADDRESS
</div>
</div>
<!-- FORM -->
<div style="
background:var(--surface);
padding:14px;
border-radius:14px;
border:1px solid var(--border);">
<div style="font-size:12px;opacity:0.6;margin-bottom:6px;">
Recipient Address
</div>
<input id="eoa" placeholder="Enter wallet address" style="width:100%;margin-bottom:12px;">
<div style="font-size:12px;opacity:0.6;margin-bottom:6px;">
Amount
</div>
<input id="amount" placeholder="Enter amount" style="width:100%;margin-bottom:15px;">
<button onclick="submitWithdrawFinal('${asset}','${network}')" style="
width:100%;
padding:14px;
border-radius:12px;
background:var(--danger);
color:var(--text);
font-weight:600;">
Withdraw
</button>
</div>
`;
}

function networkCardWithdraw(asset, name, type, speed, fee){
return `
<div onclick="selectWithdrawNetwork('${asset}','${name} ${type}')"
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
  
window.openWithdrawNetwork = function(asset){
document.querySelector(".box").innerHTML = `
<div style="display:flex;align-items:center;gap:10px;margin-bottom:15px;">
<div onclick="openAssetPage('${asset}')" style="
width:36px;height:36px;
display:flex;align-items:center;justify-content:center;
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
${networkCardWithdraw(asset,"Ethereum","Sepolia","~2 min","$5")}
${networkCardWithdraw(asset,"Arbitrum","Sepolia","~10 sec","Low")}
${networkCardWithdraw(asset,"Polygon","Amoy","~5 sec","Very low")}
${networkCardWithdraw(asset,"Base","Sepolia","~5 sec","Low")}
</div>
`;
};

window.selectWithdrawNetwork = function(asset, network){
const vault = VAULTS[network] || "Not available";
document.querySelector(".box").innerHTML = `
<!-- HEADER -->
<div style="display:flex;align-items:center;gap:10px;margin-bottom:15px;">
<div onclick="openWithdrawNetwork('${asset}')" style="
width:36px;height:36px;
display:flex;align-items:center;justify-content:center;
border-radius:10px;
background:var(--surface);
cursor:pointer;
font-size:18px;
">←</div>
<div style="font-size:18px;font-weight:600;">
${asset} Withdraw
</div>
</div>
<!-- NETWORK -->
<div style="
background:var(--surface);
padding:12px;
border-radius:12px;
border:1px solid var(--border);
margin-bottom:10px;">
<div style="font-size:12px;opacity:0.6;">Network</div>
<div>${network}</div>
</div>
<!-- INPUT -->
<input id="eoa" placeholder="Recipient Address" style="width:100%;margin-bottom:10px;">
<input id="amount" placeholder="Amount" style="width:100%;margin-bottom:15px;">
<!-- SUBMIT -->
<button onclick="submitWithdrawFinal('${asset}','${network}')" style="
width:100%;
padding:14px;
border-radius:12px;
background:var(--danger);
color:var(--text);
font-weight:600;
">
Withdraw
</button>
<div style="
margin-top:15px;
margin-bottom:100px;
background:var(--surface);
padding:12px;
border-radius:12px;
border:1px solid var(--border);
font-size:12px;
opacity:0.75;
line-height:1.6;
">
<b style="opacity:0.95;font-size:16px;font-weight:700;">
⚠️Read Before Withdrawal⚠️
 </b><br><br>
 <b style="opacity:0.9;">Withdrawal Instructions</b><br>
  • Funds will be withdrawn only to the recipient address (EOA) provided above.<br>
  • Ensure the selected network matches your destination wallet. Network mismatch will result in permanent loss of funds.<br>
  • Withdrawals are non-custodial. StabiX does not directly transfer funds to your wallet.<br><br>
  <b style="opacity:0.9;">Merkle-Based Withdrawal Process</b><br>
  • After validator submission, a Merkle Root is published and you will receive your unique Leaf via notification.<br>
  • Using this Leaf, you must manually claim your funds from the vault smart contract.<br>
  • Only the holder of the correct private key can execute the withdrawal. StabiX cannot access or control your funds.<br><br>
  <b style="opacity:0.9;">Time & Execution Window</b><br>
  • Withdrawal window is strictly limited to <b>20 hours</b> after Merkle Root publication.<br>
  • Merkle Root is generated daily at <b>16:30 UTC</b>.<br>
  • If not claimed within the valid window, your Leaf will expire and become invalid.<br><br>
  <b style="opacity:0.9;">Important Warnings</b><br>
  • After submitting a withdrawal request, the equivalent balance will be burn from your StabiX account.<br>
  • You must complete the on-chain withdrawal process after receiving your Leaf. Failure to do so will result in permanent loss.<br>
  • StabiX is not responsible for unclaimed, expired, or incorrectly executed withdrawals.<br>
  • Never share your private key, seed phrase, or wallet credentials with anyone.<br>
 </div> 
  `;
}

// ================== SUBMIT WITHDRAW (Advance Mode)==================//
// ================== SUBMIT WITHDRAW (Advance Mode) ==================//
window.submitWithdrawFinal = async function(asset, network){

  const amount = document.getElementById("amount").value.trim();
  const eoa = document.getElementById("eoa").value.trim();

  if(!amount || !eoa){
    alert("Missing fields");
    return;
  }

  if(Number(amount) <= 0){
    alert("Invalid amount");
    return;
  }

  if(!isValidAddress(eoa, network)){
    alert("Invalid wallet address");
    return;
  }

  try{

    const response = await fetch(
      "http://10.148.199.19:3000/api/withdraws",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.getToken()}`
        },
        body: JSON.stringify({
          stbx_uid: window.getCurrentUserId(),
          asset: asset,
          mode: "advanced",
          network: network,
          amount: Number(amount),
          wallet_address: eoa
        })
      }
    );

    const data = await response.json();

   if(!response.ok){

  console.error("ADVANCE WITHDRAW ERROR:", {
    status: response.status,
    response: data
  });

  let errorMessage = data.message || "Withdraw request failed";

  if(data.errors && Array.isArray(data.errors)){
    errorMessage = data.errors
      .map(error => error.msg)
      .join("\n");
  }

  alert(errorMessage);
  return;
}

    alert(
      "Withdraw Request Submitted\nYour Merkle Proof will be available once the batch is created. Withdraw only after receiving the proof. Withdrawals require your private key StabiX cannot withdraw funds on your behalf.."
    );

    goDeposit();

  }catch(err){

    console.error(err);
    alert("Server Error");

  }
};