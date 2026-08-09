import "./Validatoradjust.js";
import "./approvereq.js";
import "./rejectreq.js";
import "./loadrequest.js";
import "./loadusers.js";
import "./checkbalance.js";

/* ================= VALIDATOR PANEL ================= */
window.validatorPanel = function () {
    return `
<hr>
s
<h3>Validator Panel</h3>

<input
id="vUser"
placeholder="Target STBX UID (STBXX..)"
>

<select id="vAsset">
<option value="USDC">USDC</option>
<option value="USDT">USDT</option>
</select>

<button onclick="checkUserBalance()">
Check Balance
</button>

<div
id="balanceOut"
class="small"
style="margin-top:8px"
></div>

<hr>
<h3>Pending Requests</h3>
<button onclick="loadRequests()">
Load Pending
</button>

<div
id="vout"
style="margin-top:10px"
></div>

<hr>
<h3>All Users</h3>
<button onclick="loadAllUsers()">
Load Users
</button>

<div
id="userCount"
class="small"
style="margin-top:6px"
></div>

<div
id="userList"
style="margin-top:10px"
></div>

<hr>
<h3>Send Notification</h3>
<input
id="vTitle"
placeholder="Title (e.g. Merkle Root Updated)"
>

<input
id="vBody"
placeholder="Message (details)"
>

<button
onclick="sendValidatorNotification()"
style="
background:var(--primary);
color:var(--bg);
font-weight:bold;
"
>
Send Notification
</button>
`;
};