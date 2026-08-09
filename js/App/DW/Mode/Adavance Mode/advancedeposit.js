// ================= Advance Mode Flow(Deposit Flow)=================
window.openDeposit = function(asset){
document.querySelector(".box").innerHTML = `
<!-- HEADER -->
<div style="display:flex;align-items:center;gap:10px;margin-bottom:15px;">
<div onclick="openAssetPage('${asset}')"style="
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
<!-- NETWORK LIST -->
<div style="display:flex;flex-direction:column;gap:12px;">
${networkCard(asset,"Ethereum","(Testnet)","~2 min","$5 fee")}
${networkCard(asset,"Arbitrum","(Testnet)","~10 sec","Low fee")}
${networkCard(asset,"Polygon","(Testnet)","~5 sec","Very low")}
${networkCard(asset,"Base","(Testnet)","~5 sec","Low fee")}
</div>
`;
}

function networkCard(asset, name, type, speed, fee){
return `
<div onclick="selectNetwork('${asset}','${name} ${type}')"
style="
padding:14px;
border-radius:14px;
background:var(--surface);
border:1px solid var(--border);
cursor:pointer;
">
<!-- NETWORK NAME -->
<div style="font-weight:600;font-size:15px;">${name}
<span style="opacity:0.5;font-size:12px;"> ${type}</span>
</div>
<!-- SPEED -->
<div style="font-size:12px;opacity:0.6;margin-top:6px;">
Speed: ${speed}
</div>
<!-- FEE -->
<div style="font-size:12px;opacity:0.6;">
Fee: ${fee}
</div>
</div>
`;
}

window.selectNetwork = function(asset, network){
const vault = VAULTS[asset]?.[network] || "Not available";
document.querySelector(".box").innerHTML = `
<!-- HEADER -->
<div style="display:flex;align-items:center;gap:10px;margin-bottom:15px;">
<div onclick="openDeposit('${asset}')" style="
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
<!-- VAULT -->
<div style="
background:var(--surface);
padding:12px;
border-radius:12px;
border:1px solid var(--border);
margin-bottom:15px;">
<div style="font-size:12px;opacity:0.6;">Vault Address</div>
<a href="${EXPLORERS[network]}${vault}" target="_blank" style="
font-size:13px;
color:var(--primary);
word-break:break-all;
text-decoration:none;">
${vault}
</a>
</div>
<!-- INPUT -->
<input id="amount" placeholder="Amount" style="width:100%;margin-bottom:10px;">
<input id="txHash" placeholder="Transaction Hash" style="width:100%;margin-bottom:10px;">
<input id="eoa" placeholder="Your Wallet Address" style="width:100%;margin-bottom:15px;">
<!-- SUBMIT -->
<button onclick="submitDepositFinal('${asset}','${network}')" style="
width:100%;
padding:14px;
border-radius:12px;
background:var(--success);
color:var(--bg);
font-weight:600;
">
Deposit
</button>
<div style="
margin-top:15px;
margin-bottom:100px;
background:#0b1220;
padding:12px;
border-radius:12px;
border:1px solid var(--border);
font-size:12px;
opacity:0.75;
line-height:1.6;">
<b style="opacity:0.95;font-size:16px;font-weight:700;">
⚠️ Read Before Deposit ⚠️
</b><br><br>
<b style="opacity:0.9;">Deposit Instructions</b><br>
• You must first approve and deposit funds from your EOA wallet. This action requires your private key signature to on chain vault interaction.<br>
• Ensure you are using your own wallet (EOA). Never share your private key or wallet credentials with anyone.<br>
• Only deposit supported assets (USDT / USDC) on the selected network.<br>
• Sending assets from the wrong network or unsupported tokens will result in permanent loss of funds.<br><br>

<b style="opacity:0.9;">On-Chain Deposit Process</b><br>
• Deposit must be executed directly from your wallet to the provided vault address.<br>
• After completing the transaction, you must submit the same wallet address (EOA), transaction hash, and exact deposited amount.<br>
• Incorrect or mismatched details may lead to rejection or delay in processing.<br><br>

<b style="opacity:0.9;">Validation & Minting</b><br>
• Deposits are verified by validator.<br>
• After successful verification, the equivalent amount will be minted to your StabiX account.<br>
• Processing time may vary depending on network confirmations it's usually takes few minutes.<br><br>

<b style="opacity:0.9;">Important Warnings</b><br>
• Always use the same wallet address (EOA) that was used to perform the deposit transaction.<br>
• Providing a different wallet address will result in failed minting and loss of credit.<br>
• Double-check transaction hash and amount before submission.<br>
• Do not send funds from exchanges or custodial wallets.<br><br>

<b style="opacity:0.9;">Non-Custodial Notice</b><br>
• Your funds remain on-chain and are never held in StabiX custody.<br>
• StabiX cannot access, control, or recover your funds.<br>
</div>
`;
}

// ================== SUBMIT DEPOSIT(Advance Mode)==================//
window.submitDepositFinal = async function(asset, network){

  const amount = document.getElementById("amount").value.trim();
  const txHash = document.getElementById("txHash").value.trim();
  const eoa = document.getElementById("eoa").value.trim();

  if(!amount || !txHash || !eoa){
    alert("Fill all fields");
    return;
  }

  if(Number(amount) <= 0){
    alert("Invalid amount");
    return;
  }

  try{

    const response = await fetch(
      "http://localhost:3000/api/deposits",
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
          blockchain_tx_hash: txHash
        })
      }
    );

    const data = await response.json();

    if(!response.ok){
      alert(data.message || "Deposit request failed");
      return;
    }

    alert("Deposit request sent");

    goDeposit();

  }catch(err){

    console.error(err);
    alert("Server Error");
s
  }
};