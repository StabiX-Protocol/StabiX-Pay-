window.loadAllUsers = async ()=>{
const listDiv = document.getElementById("userList");
const countDiv = document.getElementById("userCount");
listDiv.innerHTML = "Loading...";
countDiv.innerHTML = "";
try{
const snap = await getDocs(collection(db,"users"));
countDiv.innerHTML = `Total Users: <b>${snap.size}</b>`;
let html = "";
snap.forEach(d=>{
const u = d.data();
const username = u.username ? u.username : "No username";
const stbxId = u.walletAddress ? u.walletAddress : d.id;
const eoa = u.eoaAddress ? u.eoaAddress : "Not added";
  
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
}catch(e){
listDiv.innerHTML =
"<span class='small'>Error loading users</span>";
}
};
