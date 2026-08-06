/* ================= Setting Navigation ================= */
window.goSettings = () => {
selectTab("settings");
document.querySelector(".box").innerHTML = `
<!-- TITLE -->
<div style="font-size:20px;font-weight:700;margin-bottom:20px;">
Settings
</div>

<div onclick="openTheme()" style="
display:flex;
justify-content:space-between;
padding:14px 0;
border-bottom:1px solid var(--border);
cursor:pointer;
">
<div>
<div>Theme</div>
</div>
<div style="opacity:.5;">></div>
</div>

<div onclick="openSupport()" style="
display:flex;
justify-content:space-between;
padding:14px 0;
border-bottom:1px solid var(--border);
cursor:pointer;
">
<div>Support</div>
<div style="opacity:0.5;">›</div>
</div>

<div onclick="openAbout()" style="
display:flex;
justify-content:space-between;
padding:14px 0;
border-bottom:1px solid var(--border);
cursor:pointer;
">
<div>About</div>
<div style="opacity:0.5;">›</div>
</div>
<!-- LOGOUT -->
<div onclick="logout()" style="
margin-top:30px;
text-align:center;
color:var(--danger);
font-weight:600;
cursor:pointer;
">
Logout
</div>
<div id="logoutPopup" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);justify-content:center;align-items:center;z-index:9999;">
  <div style="width:280px;background:var(--surface);border-radius:16px;padding:20px;text-align:center;">
    <div style="font-size:18px;font-weight:700;">Logout?</div>
    <div style="opacity:.7;margin:12px 0 20px;">Are you sure you want to logout?</div>

    <div style="display:flex;gap:10px;">
      <button onclick="closeLogoutPopup()" style="flex:1;">Cancel</button>
      <button onclick="confirmLogout()" style="flex:1;background:var(--danger);color:var(--text);">Logout</button>
    </div>
  </div>
</div>
`;
};

window.openTheme = () => {
document.querySelector(".box").innerHTML = `

<div onclick="goSettings()" style="
font-size:18px;
opacity:.7;
margin-bottom:24px;
cursor:pointer;
">
← Back
</div>

<div style="
font-size:20px;
font-weight:700;
margin-bottom:28px;
">
Theme
</div>

<div style="
color:var(--subtext);
margin-bottom:24px;
">
Choose your preferred appearance.
</div>

<div onclick="changeTheme('system')" style="
display:flex;
justify-content:space-between;
padding:16px 0;
border-bottom:1px solid var(--border);
cursor:pointer;
">
<div> System Default</div>
<div id="systemTick" class="radio"></div>
</div>

<div onclick="changeTheme('light')" style="
display:flex;
justify-content:space-between;
padding:16px 0;
border-bottom:1px solid var(--border);
cursor:pointer;
">
<div> Light</div>
<div id="lightTick" class="radio"></div>
</div>

<div onclick="changeTheme('dark')" style="
display:flex;
justify-content:space-between;
padding:16px 0;
border-bottom:1px solid var(--border);
cursor:pointer;
">
<div> Dark</div>
<div id="darkTick" class="radio"></div>
</div>
`;
refreshThemeTicks();
};

window.refreshThemeTicks = () => {
const mode = localStorage.getItem("theme") || "system";
const s = document.getElementById("systemTick");
const l = document.getElementById("lightTick");
const d = document.getElementById("darkTick");
[s,l,d].forEach(el=>{
if(el) el.classList.remove("active");
});
if(mode==="system" && s) s.classList.add("active");
if(mode==="light" && l) l.classList.add("active");
if(mode==="dark" && d) d.classList.add("active");
};

window.changeTheme = (mode) => {
localStorage.setItem("theme",mode);
if(mode==="system"){
document.documentElement.removeAttribute("data-theme");
}else{
document.documentElement.setAttribute("data-theme",mode);
}
goSettings();
setTimeout(()=>{
const t=document.getElementById("themeSubtitle");
if(t){
t.innerText=
mode==="system" ? "System Default" :
mode==="light" ? "Light" :
"Dark";
}
},10);
};

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
if((localStorage.getItem("theme") || "system") === "system"){
changeTheme("system");
}

});

window.logout = () => {
    document.getElementById("logoutPopup").style.display = "flex";
};

window.closeLogoutPopup = () => {
    document.getElementById("logoutPopup").style.display = "none";
};

window.confirmLogout = async () => {
    document.getElementById("logoutPopup").style.display = "none";

    try{
await fetch("http://localhost:3000/api/auth/logout",{
method:"POST",
headers:{
Authorization:`Bearer ${window.getToken()}`
}
});
}catch(e){
console.log(e);
}

    localStorage.removeItem("stbx_uid");
    localStorage.removeItem("stbx_google_uid");
    localStorage.removeItem("primaryAsset");

    window.WALLET = null;

    const nav = document.getElementById("bottomNav");
    if (nav) nav.style.display = "none";

    appDiv("");

    renderSetup();
};

window.openSupport = () => {
document.querySelector(".box").innerHTML = `
<!-- HEADER -->
<div onclick="goSettings()" style="
margin-bottom:15px;
cursor:pointer;
opacity:0.7;
">← Back</div>

<div style="font-size:18px;font-weight:600;margin-bottom:20px;">
Support
</div>

<div style="
font-size:13px;
opacity:0.8;
margin-bottom:20px;
line-height:1.6;
">
Need help or facing an issue? Reach out to our support team.
</div>
<div onclick="window.open('https://t.me/StabiXSupport')" style="
padding:14px;
border-radius:12px;
background:var(--surface);
border:1px solid var(--border);
cursor:pointer;
text-align:center;
font-weight:600;
">
Contact on Telegram
</div>
`;
};

window.openAbout = () => {
document.querySelector(".box").innerHTML = `
<!-- HEADER -->
<div onclick="goSettings()" style="
margin-bottom:15px;
cursor:pointer;
opacity:0.7;
">← Back</div>

<div style="
background:var(--surface);
padding:16px;
border-radius:16px;
border:1px solid var(--border);
line-height:1.7;
">

<div style="
font-size:20px;
font-weight:700;
margin-bottom:12px;
">
About StabiX
</div>

<div style="
font-size:14px;
opacity:0.9;
margin-bottom:18px;
">
StabiX is a stablecoin payment and transfer protocol built to simplify blockchain transactions and remove the complexity that normally comes with crypto payments. Unlike traditional blockchain transfers that often require wallet popups, gas fees, network switching, confirmations, and long settlement times, StabiX combines custodial, non-custodial, and off-chain settlement systems to make transactions faster, smoother, and easier to use. The protocol supports both instant transfers and advanced vault based transaction flows across multiple blockchain networks, allowing users to send and receive stablecoins with minimal friction while still interacting with blockchain backed infrastructure. StabiX is designed for fast digital payments, simplified stablecoin usage, reduced transaction delays, and a more practical user experience without unnecessary blockchain complexity. Protocol transactions are free for users, and the system is built with security focused transaction handling, vault architecture, request validation flows,merkle roots and blockchain verification mechanisms.
</div>

<div style="
font-size:14px;
margin-bottom:18px;
">
Detailed technical architecture, protocol systems, and infrastructure information are available in the official StabiX Whitepaper.
</div>

<a href="https://your-whitepaper-link.com" target="_blank" style="
display:inline-block;
padding:10px 14px;
border-radius:10px;
background:var(--primary);
color:var(--text);
text-decoration:none;
font-size:13px;
font-weight:600;
margin-bottom:18px;
">
View Whitepaper
</a>

<div style="
border-top:1px solid var(--border);
padding-top:14px;
font-size:13px;
line-height:1.7;
opacity:0.78;
">

<b style="font-size:15px;opacity:1;">Founder</b><br><br>

StabiX is developed by <b style="color:var(--success);">Sumedh Dabhade</b>, focused on building faster, simpler, and more practical stablecoin payment infrastructure by reducing blockchain complexity, transaction friction, wallet popup dependency, gas fee overhead, and settlement delays while keeping digital payments more accessible for everyday users.<br><br>

<a href="https://x.com/SumedhDabhade10" target="_blank" style="
color:var(--primary);
text-decoration:none;
font-weight:600;
">
@SumedhDabhade10
</a>

</div>

`;
};



