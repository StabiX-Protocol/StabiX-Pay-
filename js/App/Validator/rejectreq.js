window.rejectReq = async (type, STRId) => {
  try {
    const endpoint =
      type === "deposit"
        ? `/api/validator/deposit/reject/${STRId}`
        : `/api/validator/withdraw/reject/${STRId}`;

    const response = await fetch(
      `http://localhost:3000${endpoint}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${window.getToken()}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Reject failed");
      return;
    }

    alert("Request rejected");
    loadRequests();

  } catch (err) {
    console.log(err);
    alert("Server Error");
  }
};