window.sendUSDC = async () => {

  const toWallet = document.getElementById("sendTo").value.trim();
  const amount = Number(document.getElementById("sendAmt").value);

  if (!toWallet || amount <= 0) {
    alert("Invalid Input");
    return;
  }

  try {

    const idempotency_key = crypto.randomUUID();

const response = await fetch(
  apiUrl("/api/transactions/send"),
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${window.getToken()}`
    },
    body: JSON.stringify({
      receiver_stbx_uid: toWallet,
      asset: window.primaryAsset,
      amount: amount,
      idempotency_key: idempotency_key
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
