window.openTxDetail = async (STRId) => {

  try {

    const response = await fetch(
      `http://10.148.199.19:3000/api/transactions/${STRId}`,
      {
        headers: {
          Authorization: `Bearer ${window.getToken()}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Transaction not found");
      return;
    }

    const t = data.transaction;

    const displayAmount = Number(t.amount).toFixed(2);

    const isCredit =
      t.type === "received" ||
      t.type === "deposit";

    let from = "";
    let to = "";

    if (t.type === "deposit") {

      from = t.eoa_address || "External";
      to = t.stbx_uid;

    } else if (t.type === "withdraw") {

      from = t.stbx_uid;
      to = t.eoa_address || "External";

    } else {

      from = isCredit
        ? (t.counterparty || "System")
        : t.stbx_uid;

      to = isCredit
        ? t.stbx_uid
        : (t.counterparty || "System");

    }

    document.querySelector(".box").innerHTML = `

<div style="padding:20px 16px 100px; position:relative;">

<div onclick="goHistory()" style="
position:absolute;
top:20px;
left:16px;
width:36px;
height:36px;
border-radius:10px;
background:var(--surface);
display:flex;
align-items:center;
justify-content:center;
cursor:pointer;
">
←
</div>

<div style="text-align:center;margin-top:40px;">

<div style="
font-size:36px;
font-weight:700;
letter-spacing:0.5px;">

${displayAmount} ${t.asset}

</div>

<div style="
margin-top:6px;
font-size:15px;
font-weight:600;
color:${
  t.type === "deposit" ||
  t.type === "received"
    ? "var(--success)"
    : "var(--danger)"
};">

${
  t.type === "deposit"
    ? "Deposit"
    : t.type === "withdraw"
      ? "Withdraw"
      : t.type === "received"
        ? "Received"
        : "Sent"
}

</div>

<div style="
margin-top:8px;
font-size:14px;
color:var(--success);
font-weight:600;">

✔ Completed

</div>

<div style="
margin-top:6px;
font-size:12px;
color:var(--subtext);">

${new Date(t.created_at).toLocaleString()}

</div>

<div style="
margin-top:8px;
font-size:12px;
color:var(--primary);
font-weight:600;
word-break:break-all;">

STR ID : ${t.STRId}

</div>

</div>

<div style="
margin:20px 0;
height:1px;
background:var(--border);">
</div>

<div style="
background:var(--surface);
border:1px solid var(--border);
border-radius:16px;
padding:16px;">

<div style="margin-bottom:14px;">

<div style="
color:var(--subtext);
font-size:12px;">

From

</div>

<div style="
font-weight:600;
font-size:14px;
word-break:break-all;">

${from}

</div>

</div>

<div>

<div style="
color:var(--subtext);
font-size:12px;">

To

</div>

<div style="
font-weight:600;
font-size:14px;
word-break:break-all;">

${to}

</div>

</div>

</div>

</div>

`;

  } catch (err) {

    console.log(err);
    alert("Server Error");

  }

};