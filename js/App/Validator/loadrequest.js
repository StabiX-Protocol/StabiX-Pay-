window.loadRequests = async () => {

  try {

    const response = await fetch(
      "http://10.148.199.19:3000/api/validator/pending-requests",
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

    let html = "";

    data.requests.forEach((r) => {

      const time = r.created_at
        ? new Date(r.created_at).toLocaleString()
        : "";

      html += `
<div class="tx">

<b>${r.type.toUpperCase()} ${r.amount} ${r.asset || "USDC"}</b>

<span class="small">

User ID: ${r.stbx_uid}<br>

Wallet: ${r.eoa_address || "N/A"}<br>

Network: ${r.network || "N/A"}<br>

Mode: ${r.mode || "advanced"}<br>

STR: ${r.STRId || "N/A"}<br>

${r.blockchain_tx_hash
? `Tx Hash: ${r.blockchain_tx_hash}<br>`
: ""}

Time: ${time}

</span>

<br><br>

<button onclick="approveReq('${r.type}','${r.STRId}')">
Approve
</button>

<button onclick="rejectReq('${r.id}')">
Reject
</button>

</div>
`;

    });

    document.getElementById("vout").innerHTML =
      html || "<span class='small'>No pending requests</span>";

  } catch (err) {

    console.log(err);

    alert("Server Error");

  }

};
