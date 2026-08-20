window.checkUserBalance = async () => {

  const userId =
    document.getElementById("vUser").value.trim();

  const asset =
    document.getElementById("vAsset").value;

  if (!userId) {

    alert("Enter user ID");

    return;

  }

  try {

    const response = await fetch(
      `http://10.148.199.19:3000/api/validator/users/${userId}/balance`,
      {
        headers: {
          Authorization: `Bearer ${window.getToken()}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {

      alert(data.message || "User not found");

      return;

    }




    const balanceRow = (data.balances || []).find(
  (item) => item.asset === asset
);

const balance = balanceRow
  ? Number(balanceRow.balance)
  : 0;

document.getElementById("balanceOut").innerText =
  `${asset} Balance: ${balance}`;
  


    document.getElementById("balanceOut").innerText =
      `${asset} Balance: ${balance}`;

  } catch (err) {

    console.log(err);

    alert("Server Error");

  }

};