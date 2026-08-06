window.approveReq = async (reqId) => {

  try {

    const response = await fetch(
      `http://localhost:3000/api/validator/approve/${reqId}`,
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