 /* ================= VALIDATOR PANEL ================= */
function validatorPanel(){
return `
<hr>
<h3>Validator Panel</h3>
<input id="vUser" placeholder="Target STBX UID (STBXX..)">
<select id="vAsset">
<option value="USDC">USDC</option>
<option value="USDT">USDT</option>
</select>

<input id="vEOA" placeholder="Wallet Address (0x...)" style="
width:100%;
margin-top:8px;
padding:10px;
border-radius:8px;
border:1px solid var(--border);
background:var(--surface);
color:var(--text);
">

<select id="vType">
<option value="deposit">Deposit</option>
<option value="withdraw">Withdraw</option>
</select>
<input id="vAmount" type="number" placeholder="Amount">
<button onclick="checkUserBalance()">Check Balance</button>
<div id="balanceOut" class="small" style="margin-top:8px"></div>
<button onclick="validatorAdjust()">Apply</button>

<hr>
<button onclick="loadRequests()">Load Pending</button>
<div id="vout"></div>

<hr>
<h3>All Users</h3>
<button onclick="loadAllUsers()">Load Users</button>
<div id="userCount" class="small" style="margin-top:6px"></div>
<div id="userList" style="margin-top:10px"></div>

<hr>
<h3>Send Notification</h3>
<input id="vTitle" placeholder="Title (e.g. Merkle Root Updated)">
<input id="vBody" placeholder="Message (details)">
<button onclick="sendValidatorNotification()" 
style="background:var(--primary);color:var(--bg);font-weight:bold">
Send Notification
</button>
`;
}
