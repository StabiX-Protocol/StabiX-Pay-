window.loadAllUsers = async () => {

  const listDiv = document.getElementById("userList");
  const countDiv = document.getElementById("userCount");

  listDiv.innerHTML = "Loading...";
  countDiv.innerHTML = "";

  try {

    const response = await fetch(
  apiUrl("/api/validator/users"),{
        headers: {
          Authorization: `Bearer ${window.getToken()}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {

      listDiv.innerHTML =
        "<span class='small'>Error loading users</span>";

      return;

    }

    const users = data.users || [];

    countDiv.innerHTML =
      `Total Users: <b>${users.length}</b>`;

    let html = "";

    users.forEach((u) => {

      const username =
        u.username || "No username";

      const stbxId =
        u.stbx_uid || "N/A";

      const eoa =
        u.eoa_address || "Not added";

      html += `

<div class="tx">

<b>${username}</b><br>

<span class="small">
StabiX ID: ${stbxId}
</span><br>

<span class="small">
EOA: ${eoa}
</span>

</div>

`;

    });

    listDiv.innerHTML =
      html || "<span class='small'>No users found</span>";

  } catch (err) {

    console.log(err);

    listDiv.innerHTML =
      "<span class='small'>Error loading users</span>";

  }

};