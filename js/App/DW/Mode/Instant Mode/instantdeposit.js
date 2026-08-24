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
">
←
</div>

<div style="font-size:18px;font-weight:600;">
Select Network
</div>

</div>


<div style="display:flex;flex-direction:column;gap:12px;">
${instantNetworkCard(asset,"Ethereum","(Testnet)","~2 min","$5 fee")}
${instantNetworkCard(asset,"Arbitrum","(Testnet)","~10 sec","Low fee")}
${instantNetworkCard(asset,"Polygon","(Testnet)","~5 sec","Very low")}
${instantNetworkCard(asset,"Base","(Testnet)","~5 sec","Low fee")}

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
cursor:pointer;
">

<div style="font-weight:600;font-size:15px;">

${name}

<span style="opacity:0.5;font-size:12px;">
${type}
</span>

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

const wallet = window.WALLETS[asset]?.[network] || "Not available";

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
">
←
</div>

<div style="font-size:18px;font-weight:600;">
${asset} Deposit
</div>

</div>


<div style="
background:var(--surface);
padding:12px;
border-radius:12px;
border:1px solid var(--border);
margin-bottom:10px;
">

<div style="font-size:12px;opacity:0.6;">
Network
</div>

<div>
${network}
</div>

</div>


<div style="
background:var(--surface);
padding:12px;
border-radius:12px;
border:1px solid var(--border);
margin-bottom:15px;
">

<div style="font-size:12px;opacity:0.6;">
Wallet Address
</div>


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
font-size:11px;
">

Copy

</button>

</div>


<input
id="amount"
type="number"
inputmode="decimal"
placeholder="Amount"
style="width:100%;margin-bottom:10px;"
>


<input
id="txHash"
placeholder="Transaction Hash"
style="width:100%;margin-bottom:10px;"
>


<input
id="eoa"
placeholder="Your Wallet Address"
style="width:100%;margin-bottom:15px;"
>


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


window.submitInstantDeposit = async function(asset, network){

  const amount = document.getElementById("amount").value.trim();

  const txHash = document.getElementById("txHash").value.trim();

  const eoa = document.getElementById("eoa").value.trim();


  if(!amount || !txHash || !eoa){

    alert("All fields are required");

    return;

  }


  if(Number(amount) <= 0){

    alert("Invalid amount");

    return;

  }


  if(!isValidTxHash(txHash)){

    alert("Invalid transaction hash");

    return;

  }


  if(!isValidAddress(eoa, network)){

    alert("Invalid wallet address");

    return;

  }


  try{

    const response = await fetch(
      apiUrl("/api/deposits"),
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

          blockchain_tx_hash: txHash

        })

      }
    );


    const data = await response.json();


    if(!response.ok){

      alert(data.message || "Deposit request failed");

      return;

    }


    alert(
      "Deposit Request Submitted\nYour funds will reflect in StabiX shortly"
    );


    goDeposit();


  }catch(err){

    console.error(err);

    alert("Server Error");

  }

};