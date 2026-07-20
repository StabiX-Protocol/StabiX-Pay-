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
