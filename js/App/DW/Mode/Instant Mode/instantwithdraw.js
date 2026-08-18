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

window.selectInstantWithdraw = function(asset, network){
document.querySelector(".box").innerHTML = `
<!-- HEADER -->
<div style="display:flex;align-items:center;gap:10px;margin-bottom:15px;">
<div onclick="openInstantWithdraw('${asset}')" style="
width:36px;
height:36px;
display:flex;
align-items:center;
justify-content:center;
border-radius:10px;
background:var(--surface);
cursor:pointer;
font-size:18px;">
←
</div>

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
margin-bottom:10px;
">

<div style="font-size:12px;opacity:0.6;">Network</div>
<div>${network}</div>
</div>

<!-- FORM (same container as deposit) -->
<div style="
background:var(--surface);
padding:12px;
border-radius:12px;
border:1px solid var(--border);
margin-bottom:15px; ">

<div style="font-size:12px;opacity:0.6;margin-bottom:6px;">
Your Wallet Address
</div>

<input id="eoa" placeholder="Enter your wallet address"
style="width:100%;margin-bottom:12px;"
maxlength="42">

<div style="font-size:12px;opacity:0.6;margin-bottom:6px;">
Amount
</div>

<input id="amount" type="number" inputmode="decimal"
placeholder="Enter amount"
style="width:100%;margin-bottom:15px;">

<button onclick="submitInstantWithdraw('${asset}','${network}')" style="
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

window.submitInstantWithdraw = async function(asset, network){

  const to = document.getElementById("eoa").value.trim();
  const amount = document.getElementById("amount").value.trim();

  if(!to || !amount){
    alert("Missing fields");
    return;
  }

  if(Number(amount) <= 0){
    alert("Invalid amount");
    return;
  }

  if(!isValidAddress(to, network)){
    alert("Invalid wallet address");
    return;
  }

  try{

    const response = await fetch(
      "http://10.148.199.19:3000/api/withdraw",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.getToken()}`
        },
        body: JSON.stringify({
          stbx_uid: window.getCurrentUserId(),
          asset: asset,
          mode: "instant",
          network: network,
          amount: Number(amount),
          wallet_address: to
        })
      }
    );

   const contentType = response.headers.get("content-type") || "";

let data;

if (contentType.includes("application/json")) {
  data = await response.json();
} else {
  const text = await response.text();

  console.error("WITHDRAW SERVER RESPONSE:", text);

  alert("Withdraw server returned an invalid response.");
  return;
}

if(!response.ok){
  alert(data.message || "Withdraw request failed");
  return;
}

    alert(
      "Withdraw Request Submitted\nYour request has been sent for validation."
    );

    goDeposit();

  }catch(err){

    console.error(err);
    alert("Server Error");

  }
};