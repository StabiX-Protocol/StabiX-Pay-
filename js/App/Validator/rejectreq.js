window.rejectReq = async (reqId) => {
  try {

    const response = await fetch(
      `http://localhost:3000/api/validator/reject/${reqId}`,
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

    alert("Rejected");
s
    loadRequests();

    renderApp();

  } catch (err) {

    console.log(err);

    alert("Server Error");

  }

};