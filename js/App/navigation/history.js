window.goHistory = () => {
document.querySelector(".box").innerHTML = `
<h2>Transaction History</h2>
<div style="
margin-top:12px;
">
<div style="
position:relative;
">
<input
id="searchInput"
placeholder="Search transactions..."
style="
width:100%;
padding:12px 14px 12px 38px;
border-radius:10px;
border:1px solid var(--border);
background:var(--surface);
color:var(--text);
font-size:14px;
box-sizing:border-box;
outline:none;
"onfocus="this.style.border='1px solid var(--primary)'"
onblur="this.style.border='1px solid var(--border)'"
>
<svg viewBox="0 0 24 24" fill="none" style="
position:absolute;
left:12px;
top:60%;
transform:translateY(-50%);
width:16px;
height:16px;
opacity:0.6;
pointer-events:none;
">
<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
<path d="M20 20L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>
</div>
</div>

<div id="filterBar" style="
display:flex;
gap:8px;
overflow-x:auto;
margin:10px 0;
">
<button onclick="openFilter('date')" class="fbtn">Date ▼</button>
<button id="assetFilterBtn" onclick="openFilter('asset')" class="fbtn">Asset ▼</button>
<button id="amountFilterBtn" onclick="openFilter('amount')" class="fbtn">Amount ▼</button>
<button id="typeFilterBtn" onclick="openFilter('type')" class="fbtn">Type ▼</button>
</div>

<div id="history" style="padding-bottom:100px;">Loading...</div>
`;
loadHistoryByDate();
setTimeout(setupHistorySearch, 100);
selectTab("history");
};

 /* ================= Filter ================= */
window.openFilter = (type)=>{
let html = "";
if(type === "amount"){
html = `
<div class="sheet">
<h3 style="margin:0 0 12px 0;">Amount Filter</h3>
<div class="assetList">
<div class="assetItem" onclick="setAmountRange(0,50)">
<span>0 - 50</span>
</div>
<div class="assetItem" onclick="setAmountRange(50,500)">
<span>50 - 500</span>
</div>
<div class="assetItem" onclick="setAmountRange(500,null)">
<span>500+</span>
</div>
</div>
<button onclick="clearAmountFilter()" 
style="margin-top:10px;width:100%;padding:12px;border-radius:12px;
background:var(--surface);color:var(--text);border:none;">
Clear Filter
</button>
<button onclick="applyFilter('amount')" class="applyBtn">
  Apply Filter
</button>
</div>
`;
}

  if(type === "type"){
html = `
<div class="sheet">
<h3 style="margin:0 0 12px 0;">Transaction Type</h3>
<div class="assetList">
<div class="assetItem" onclick="setType('sent')">
<span>Sent</span>
</div>
<div class="assetItem" onclick="setType('received')">
<span>Received</span>
</div>
<div class="assetItem" onclick="setType('deposit')">
<span>Deposit</span>
</div>
<div class="assetItem" onclick="setType('withdraw')">
<span>Withdraw</span>
</div>
</div>
<button onclick="clearTypeFilter()" 
style="margin-top:10px;width:100%;padding:12px;border-radius:12px;
background:var(--surface);color:var(--text);border:none;">
Clear Filter
</button>
<button onclick="applyFilter('type')" class="applyBtn">
Apply
</button>
</div>
`;
}

if(type === "asset"){
html = `
<div class="sheet">
<h3 style="margin:0 0 12px 0;">Select Asset</h3>
<div class="assetList">
<div class="assetItem" onclick="setAsset('USDT')">
<img src="media/tether-usdt-logo.png" />
<span>USDT</span>
</div>
<div class="assetItem" onclick="setAsset('USDC')">
<img src="media/usd-coin-usdc-logo.png" />
<span>USDC</span>
</div>
</div>

<button onclick="clearAssetFilter()" 
style="margin-top:10px;width:100%;padding:12px;border-radius:12px;
background:var(--surface);color:var(--text);border:none;">
Clear Filter
</button>

<button onclick="applyFilter('asset')" class="applyBtn">
  Apply
</button>

</div>
`;
}

  if(type === "date"){
const today = new Date().toISOString().split("T")[0];
html = `
<div class="sheet">
<h3 style="margin:0 0 10px 0;">Select Date</h3>
<input type="date" id="filterDate" value="${today}" max="${today}" />

<div style="margin-top:12px; width:100%;">
<button onclick="enableRange()" style="width:100%;padding:12px;border-radius:10px;background:var(--surface);color:var(--text);border:none;">
Custom Date 
</button>
</div>
<div id="rangeBox" style="display:none; margin-top:12px; width:100%;">
<label>From</label>
<input type="date" id="fromDate" />
<label style="margin-top:8px;display:block;">To</label>
<input type="date" id="toDate" />
</div>

<button onclick="clearDateFilter()" 
style="margin-top:10px;width:100%;padding:12px;border-radius:12px;
background:var(--surface);color:var(--text);border:none;">
Clear Filter
</button>

<button onclick="applyFilter('date')">
Apply Filter
</button>
</div>
`;
}
document.body.insertAdjacentHTML("beforeend", `
<div id="overlay" onclick="closeFilter()"></div>
<div id="bottomSheet">${html}</div>
`);
setTimeout(() => {
const input = document.getElementById("filterDate");
const today = new Date().toISOString().split("T")[0];
if(input){
input.value = today;
input.max = today;
}
}, 0);
};

window.closeFilter = ()=>{
document.getElementById("overlay")?.remove();
document.getElementById("bottomSheet")?.remove();
};

window.applyFilter = (type)=>{
window.filters = window.filters || {};

if(type === "date"){
const single = document.getElementById("filterDate")?.value;
const from = document.getElementById("fromDate")?.value;
const to = document.getElementById("toDate")?.value;
if(from && to){
if(from > to){
alert("From date cannot be after To date");
return;
}
window.filters.fromDate = from;
window.filters.toDate = to;
delete window.filters.date;
}
else{
window.filters.date = single || null;
delete window.filters.fromDate;
delete window.filters.toDate;
}
}
closeFilter();
const btn = document.querySelector('[onclick="openFilter(\'date\')"]');
if(window.filters.fromDate && window.filters.toDate){
btn.innerText = window.filters.fromDate + " → " + window.filters.toDate;
} else {
btn.innerText = window.filters.date || "Date ▼";
}
window.loadHistory();

if(type === "asset"){
const val = window.filters.asset || null;
window.filters.asset = val;
document.querySelector('[onclick="openFilter(\'asset\')"]')
.innerText = val || "Asset ▼";
}

  if(type === "amount"){
const min = document.getElementById("minAmount")?.value;
const max = document.getElementById("maxAmount")?.value;
window.filters.minAmount =window.filters.tempMin ?? (min ? Number(min) : null);
window.filters.maxAmount =window.filters.tempMax ?? (max ? Number(max) : null);
let label = "Amount ▼";
if(window.filters.minAmount != null && window.filters.maxAmount != null){
label = `${window.filters.minAmount} - ${window.filters.maxAmount}`;
} else if(window.filters.minAmount != null){
label = `${window.filters.minAmount}+`;
} else if(window.filters.maxAmount != null){
label = `< ${window.filters.maxAmount}`;
}
document.getElementById("amountFilterBtn").innerText = label;
}

if(type === "type"){
const val = window.filters.type || null;
window.filters.type = val;
const btn = document.getElementById("typeFilterBtn");
if(btn) btn.innerText = val ? val.charAt(0).toUpperCase() + val.slice(1) : "Type ▼";
}  
};

window.enableRange = () => {
document.getElementById("rangeBox").style.display = "block";
const today = new Date().toISOString().split("T")[0];
document.getElementById("fromDate").max = today;
document.getElementById("toDate").max = today;
};

window.clearFilters = () => {
window.filters = {};
document.querySelector('[onclick="openFilter(\'date\')"]')
.innerText = "Date ▼";
document.querySelector('[onclick="openFilter(\'asset\')"]')
.innerText = "Asset ▼";
document.querySelector('[onclick="openFilter(\'amount\')"]')
.innerText = "Amount ▼";
document.querySelector('[onclick="openFilter(\'type\')"]')
.innerText = "Type ▼";
closeFilter();
window.loadHistory();
};

window.setAsset = (asset) => {
window.filters.asset = asset;
document.querySelectorAll('.assetItem').forEach(el=>{
el.style.border = '1px solid #1e293b';
});
event.currentTarget.style.border = '1px solid #2563eb';
};

window.clearAssetFilter = () => {
window.filters.asset = null;
document.getElementById("assetFilterBtn").innerText = "Asset ▼";
closeFilter();
loadHistory();
};

window.setAmountRange = (min, max) => {
window.filters.tempMin = min;
window.filters.tempMax = max;
document.querySelectorAll('.assetItem').forEach(el=>{
el.style.border = "1px solid #1e293b";
});
event.currentTarget.style.border = "1px solid #2563eb";
};

window.clearAmountFilter = () => {
window.filters.minAmount = null;
window.filters.maxAmount = null;
const btn = document.getElementById("amountFilterBtn");
if(btn) btn.innerText = "Amount ▼";
closeFilter();
loadHistory();
};
window.clearDateFilter = () => {
window.filters.date = null;
window.filters.fromDate = null;
window.filters.toDate = null;
document.querySelector('[onclick="openFilter(\'date\')"]')
.innerText = "Date ▼";
closeFilter();
loadHistory();
};

window.setType = (type) => {
window.filters.type = type;
document.querySelectorAll('.assetItem').forEach(el=>{
el.style.border = '1px solid #1e293b';
});
event.currentTarget.style.border = '1px solid #2563eb';
};

window.clearTypeFilter = () => {
window.filters.type = null;
const btn = document.getElementById("typeFilterBtn");
if(btn) btn.innerText = "Type ▼";
closeFilter();
loadHistory();
};

  
