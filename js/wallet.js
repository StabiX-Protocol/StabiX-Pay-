/* ================= USERNAME CHANGE (30 DAYS) ================= */
window.changeUsername = async ()=>{
  const snap = await getDoc(userRef);
  const last = snap.data().lastUsernameChange?.toDate();
  if(last && ((Date.now()-last)/(1000*60*60*24)) < 30)
    return alert("Username can be changed once every 30 days");

  const name = prompt("New username");
  if(!name?.trim()) return;
  await updateDoc(userRef,{ username:name.trim(), lastUsernameChange:serverTimestamp() });
  renderApp();
};
/* ================= MAIN APP ================= */
async function renderApp(){
  const user = (await getDoc(userRef)).data();
  const isValidator = (await getDoc(validatorRef)).exists();
  const now = new Date();
const yyyy = now.getFullYear();
const mm = String(now.getMonth() + 1).padStart(2,"0");
const dd = String(now.getDate()).padStart(2,"0");
const today = `${yyyy}-${mm}-${dd}`;
  appDiv(`
    <div class="box">
    <div class="refreshIcon" onclick="softRefresh()">↻</div>
    <div class="walletHeader">

<div class="userRow" onclick="toggleProfile()">
${user.username}
<span class="arrow">▼</span>
</div>

<div id="profileHidden" class="profileHidden">

<div class="small">
TG ID<br>
${WALLET}
</div>

<div class="small" style="margin-top:10px">
EOA Wallet<br>
${user.eoaAddress ? user.eoaAddress : "Not added"}
</div>

</div>

<div class="balanceBig">
${user.balance.toFixed(2)} USDC
</div>
   
<div class="walletActions">
<div class="walletAction" onclick="showSend()">
<div class="walletActionIcon">⬆</div>
<div class="walletActionLabel">Send</div>
</div>

<div class="walletAction" onclick="showReceive()">
<div class="walletActionIcon">⬇</div>
<div class="walletActionLabel">Receive</div>
</div>

<div class="walletAction" onclick="openScanner()">
<div class="walletActionIcon">▣</div>
<div class="walletActionLabel">Scan</div>
</div>

</div>
</div>


<hr>
  
      ${user.pendingRequest
  ? `<div class="warn"> Pending request under review</div>`
  : ""
      }
      
      <hr>
<h3>Deposit / Withdraw</h3>

<div style="
display:flex;
gap:10px;
margin-top:10px;
">

<button onclick="openDeposit()" style="background:#22c55e;color:#022c22;font-weight:bold">
Deposit
</button>

<button onclick="openWithdraw()" style="background:#ef4444;color:white;font-weight:bold">
Withdraw
</button>

</div>

<div id="depositBox" style="
display:none;
margin-top:10px;
padding:10px;
background:#020617;
border:1px solid #1e293b;
border-radius:12px;
">

<select id="networkSelect" onchange="showVault()">
  <option value="">Select Network</option>
  <option value="sepolia">Ethereum (Sepolia)</option>
</select>

<div id="vaultSection" style="display:none;margin-top:10px">

<div class="small">Vault Address:</div>

<div style="display:flex;align-items:center;gap:8px;width:100%">

<span style="
color:#60a5fa;
font-size:12px;
word-break:break-all;
flex:1;
">
0x710c5D40a97123903b7cB482dBe39EB35D52af0a
</span>

<button onclick="copyVault()" style="
width:auto;
padding:6px 10px;
font-size:12px;
flex-shrink:0;
">
Copy
</button>

</div>

<button onclick="showDepositForm()" style="background:#22c55e;color:#022c22;font-weight:bold">
Submit Deposit Proof 
</button>

<div id="depositForm" style="display:none;margin-top:10px">

<input id="depAmount" type="number" placeholder="Amount">

<input id="depHash" placeholder="Transaction Hash">

<button onclick="submitDeposit()">Submit Deposit</button>

</div>
</div>

</div>
<div id="withdrawBox" style="display:none;margin-top:10px">

<div class="small">Withdraw Address:</div>

<div style="
background:#020617;
border:1px solid #1e293b;
padding:10px;
border-radius:8px;
margin-top:6px;
word-break:break-all;
">

${user.eoaAddress ? user.eoaAddress : "No EOA wallet registered"}

</div>

<input id="wdAmount" type="number" placeholder="Amount">

<button onclick="submitWithdraw()">Request Withdraw</button>

</div>
      <hr>
      <h3>Transaction History</h3>

<input
  id="historyDate"
  type="date"
  value="${today}"
  max="${today}"
  onchange="loadHistoryByDate()"
/>

<div id="history">Loading...</div>

      ${isValidator ? validatorPanel() : ""}
    </div>
  `);
  loadHistoryByDate();
  // 🎉 RECEIVE POPUP (one-time)
try{
  const q = query(
    collection(db,"transactions"),
    where("userId","==",WALLET),
    orderBy("createdAt","desc")
  );

  const snap = await getDocs(q);
  if(!snap.empty){
    const docSnap = snap.docs[0];
    const t = docSnap.data();

    // sirf received ke liye
    if(t.type === "received"){
      const key = "rx_" + docSnap.id;

      // ek hi baar popup
      if(!sessionStorage.getItem(key)){
        showTxPopup(`Received ${t.amount} USDC from ${t.counterparty}`);
        sessionStorage.setItem(key,"1");
      }
    }
  }
}catch(e){
  console.log("Receive popup error", e);
}
}
 /*=============UI Interface Of Balance Name ========*/
  window.toggleProfile = ()=>{

const box = document.getElementById("profileHidden")

if(box.style.display === "block"){
box.style.display = "none"
}else{
box.style.display = "block"
}

}
  window.showSend = ()=>{
document.body.innerHTML += `
<div id="sendPopup" style="
position:fixed;
top:0;
left:0;
right:0;
bottom:0;
background:#000000cc;
display:flex;
align-items:center;
justify-content:center;
z-index:9999;
">

<div style="
background:#020617;
padding:20px;
border-radius:16px;
width:300px;
">

<h3>Send USDC</h3>

<input id="sendTo" placeholder="Receiver Wallet (TG_xxx)">

<input id="sendAmt" type="number" placeholder="Amount">

<button onclick="sendUSDC()">Send</button>

<button onclick="this.parentElement.parentElement.remove()"style="margin-top:10px;background:#1e293b">
Close
</button>

</div>
</div>
`

  }
window.showReceive = ()=>{

const wallet = WALLET

const qr = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data="+wallet

document.body.innerHTML += `
<div style="
position:fixed;
top:0;
left:0;
right:0;
bottom:0;
background:#000000cc;
display:flex;
align-items:center;
justify-content:center;
z-index:9999;
">

<div style="
background:#020617;
padding:20px;
border-radius:16px;
text-align:center;
width:300px;
">

<h3>Receive USDC</h3>

<img src="${qr}" width="180"><br><br>

<div class="small">Wallet ID</div>

<div style="
font-size:13px;
word-break:break-all;
margin-top:5px;
">
${wallet}
</div>

<button onclick="this.parentElement.parentElement.remove()" style="margin-top:15px">
Close
</button>

</div>
</div>
`

}

