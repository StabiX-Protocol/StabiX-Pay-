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

    let balance = 0;

    if (asset === "USDC") {

      balance = data.user.balance || 0;

    } else {

      balance = data.user.usdtBalance || 0;

    }

    document.getElementById("balanceOut").innerText =
      `${asset} Balance: ${balance}`;

  } catch (err) {

    console.log(err);

    alert("Server Error");

  }

};