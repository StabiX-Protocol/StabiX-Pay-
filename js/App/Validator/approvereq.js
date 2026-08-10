window.approveReq = async (type, STRId) => {

  try {

    const endpoint =
      type === "deposit"
        ? `/api/validator/deposit/approve/${STRId}`
        : `/api/validator/withdraw/approve/${STRId}`;

    const response = await fetch(
      `http://10.148.199.19:3000${endpoint}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${window.getToken()}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Approval failed");
      return;
    }

    alert("Request approved");

    loadRequests();

  } catch (err) {

    console.log(err);
    alert("Server Error");

  }

};