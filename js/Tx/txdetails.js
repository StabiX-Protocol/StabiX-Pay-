window.openTxDetail = async (txId) => {
const ref = doc(db, "transactions", txId);
const snap = await getDoc(ref);
if(!snap.exists()){
alert("Transaction not found");
return;
}
const t = snap.data();
const isCredit = t.type === "received" || t.type === "deposit";
const amount = `${isCredit ? "+" : "-"} ${t.amount} ${t.asset || "USDT"}`;
let from = "";
let to = "";
if(t.type === "deposit"){
from = t.eoa || "External";
to = t.userId;
}
else if(t.type === "withdraw"){
from = t.userId;
to = t.eoa || "External";
}
else{
from = isCredit ? (t.counterparty || "System") : t.userId;
to = isCredit ? t.userId : (t.counterparty || "System");
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
">←
</div>

<div style="text-align:center;margin-top:40px;">
<div style="
font-size:36px;
font-weight:700;
letter-spacing:0.5px;">
${t.amount} ${t.asset || "USDT"}
</div>

<div style="
margin-top:6px;
font-size:15px;
font-weight:600;
color:${
  t.type === "deposit" || t.type === "received"
    ? "var(--success)"
    : "var(--danger)"
};">
${t.type === "deposit"
 ? "Deposit"
 : t.type === "withdraw"
 ? "Withdraw"
 : t.type === "received"
 ? "Received"
 : t.type === "sent"
 ? "Sent"
 : t.type}
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
${t.createdAt?.toDate().toLocaleString() || "-"}
</div>

<div style="
margin-top:8px;
font-size:12px;
color:var(--primary);
font-weight:600;
word-break:break-all;">
STR ID : ${t.str || "-"}
</div>

</div>

<div style="margin:20px 0;height:1px;background:var(--border);"></div>

<div style="
background:var(--surface);
border:1px solid var(--border);
border-radius:16px;
padding:16px;">
    
<div style="margin-bottom:14px;">
<div style="color:var(--subtext);font-size:12px;">From</div>
<div style="font-weight:600;font-size:14px;word-break:break-all;">
${from}
</div>
</div>

<div>
<div style="color:var(--subtext);font-size:12px;">To</div>
<div style="font-weight:600;font-size:14px;word-break:break-all;">
${to}
</div>
</div>

</div>

</div>
`;
};
