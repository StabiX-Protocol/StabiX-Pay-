window.sendUSDC = async () => {

const toWallet = document.getElementById("sendTo").value.trim();
const amount = Number(document.getElementById("sendAmt").value);

if (!toWallet || amount <= 0) {
alert("Invalid Input");
return;
}

try {
const response = await fetch(
"http://10.148.199.19:3000/api/transactions/send",
{
method: "POST",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${window.getToken()}`
},
body: JSON.stringify({
sender_stbx_uid: window.getCurrentUserId(),
receiver_stbx_uid: toWallet,
asset: window.primaryAsset,
amount: amount
})
}
);

const data = await response.json();
if (!response.ok) {
alert(data.message || "Transaction Failed");
return;
}
showTxPopup(
`Sent ${amount} ${window.primaryAsset} to ${toWallet}`,
"success"
);
await window.renderApp();
} catch (err) {
console.log(err);
alert("Server Error");
}
};