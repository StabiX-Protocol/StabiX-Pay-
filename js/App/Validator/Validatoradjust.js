window.validatorAdjust = async () => {

  const userId =
    document.getElementById("vUser").value.trim();

  const type =
    document.getElementById("vType").value;

  const amount =
    Number(document.getElementById("vAmount").value);

  const asset =
    document.getElementById("vAsset").value;

  const eoa =
    document.getElementById("vEOA").value.trim();

  if (!userId || !amount) {

    alert("Invalid input");

    return;

  }

  if (
    (type === "deposit" || type === "withdraw") &&
    !eoa
  ) {

    alert("EOA required");

    return;

  }

  try {

    const response = await fetch(
      "http://10.148.199.19:3000/api/validator/manual-adjust",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.getToken()}`
        },
        body: JSON.stringify({
          stbx_uid: userId,
          type,
          amount,
          asset,
          eoa_address: eoa
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      alert(data.message);

      return;

    }

    alert(`${asset} updated`);

    loadRequests();

    renderApp();

  } catch (err) {

    console.log(err);

    alert("Server Error");

  }

};