window.MODE = null;
window.primaryAsset = localStorage.getItem("primaryAsset") || "USDT";
window.keepAssetOpen = false;
window.scanDone = false
window.scanTargetId = null
window.filters = {
type:null,
asset:null,
amount:null,
date:null
};
window.isScanFlow = false;

window.syncWalletBalances = async function () {

    try {

        const response = await fetch(
            apiUrl(`/api/balance/${window.getCurrentUserId()}`),
            {
                headers: {
                    Authorization: `Bearer ${window.getToken()}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Balance API error:", data.message);
            return false;
        }

        // Reset old balance values
        window.userData.balance = 0;
        window.userData.usdtBalance = 0;

        // DB balances
        for (const item of data.balances) {

            const asset = item.asset;
            const balance = Number(item.balance) || 0;

            if (asset === "USDT") {
                window.userData.usdtBalance = balance;
            }

            if (asset === "USDC") {
                window.userData.balance = balance;
            }
        }
        window.updateBalanceUI();

        // ================= UPDATE ASSET UI =================

const usdtEl = document.getElementById("assetUSDTBalance");
const usdcEl = document.getElementById("assetUSDCBalance");

if (usdtEl) {
    usdtEl.textContent =
        Number(window.userData.usdtBalance || 0).toFixed(2);
}

if (usdcEl) {
    usdcEl.textContent =
        Number(window.userData.balance || 0).toFixed(2);
}

// Update primary balance at top
const primaryEl = document.querySelector(".balanceBig");

if (primaryEl) {
    primaryEl.textContent =
        `${window.getPrimaryBalance()} ${window.primaryAsset}`;
}
        
        console.log("Synced balances:", {
            USDT: window.userData.usdtBalance,
            USDC: window.userData.balance
        });

        return true;

    } catch (err) {

        console.error("Balance sync error:", err);
        return false;

    }
};

/* ================= MAIN APP ================= */
window.renderApp = async function(){
const response = await fetch(
apiUrl(`/api/users/profile/${window.getCurrentUserId()}`),
{
headers: {
Authorization: `Bearer ${window.getToken()}`
}
}
);

const data = await response.json();

if (!response.ok) {
alert(data.message);
return;
}

const user = data.user;
window.userData = user;
window.syncWalletBalances();
const isVALIDATOR = window.userData.role ==="VALIDATOR";
const now = new Date();
const yyyy = now.getFullYear();
const mm = String(now.getMonth() + 1).padStart(2,"0");
const dd = String(now.getDate()).padStart(2,"0");
const today = `${yyyy}-${mm}-${dd}`;
appDiv(`
    <div class="box">
    <div class="walletHeader">

    <div class="notifBell" onclick="openNotifications()">
    <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 3C9.8 3 8 4.8 8 7V9.5C8 10.3 7.7 11 7.2 11.6L6 13.2C5.4 14 5.9 15 6.9 15H17.1C18.1 15 18.6 14 18 13.2L16.8 11.6C16.3 11 16 10.3 16 9.5V7C16 4.8 14.2 3 12 3Z" stroke="currentColor" stroke-width="1.8"/>
    <path d="M10 18C10.3 18.9 11.1 19.5 12 19.5C12.9 19.5 13.7 18.9 14 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
    <span id="notifCount" class="notifCount"></span>
    </div>

    <div class="userRow" onclick="toggleProfile()">
    ${user.username}
    <span class="arrow">▼</span>
    </div>

    
    <div id="profileHidden" class="profileHidden">

  <div style="margin-bottom:14px;">

    <div style="
      font-size:11px;
      color:var(--subtext);
      margin-bottom:4px;
    ">
      StabiX UID
    </div>

    <div style="
      font-size:15px;
      font-weight:700;
      color:var(--text);
      letter-spacing:.3px;
    ">
      ${WALLET}
    </div>

  </div>

  <div>

    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:4px;
    ">
    <span style="
        font-size:11px;
        color:var(--subtext);
      ">
        Linked Wallet Address
      </span>

      <span
        onclick="editEOA()"
        style="
          font-size:12px;
          font-weight:600;
          color:var(--primary);
          cursor:pointer;
        "
      >
        ${user.eoa_address ? "Change" : "Add"}
      </span>

    </div>
    <div style="
      font-size:13px;
      line-height:1.5;
      color:var(--text);
      word-break:break-all;
    ">
      ${user.eoa_address || "Not linked"}
    </div>

  </div>
  <br>
     <div>
    <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:4px;
    ">

        <span style="
            font-size:11px;
            color:var(--subtext);
        ">
            Username
        </span>

        <span
            onclick="changeUsername()"
            style="
                font-size:12px;
                font-weight:600;
                color:var(--primary);
                cursor:pointer;
            "
        >
            Change
        </span>

    </div>

    <div style="
        font-size:15px;
        font-weight:700;
        color:var(--text);
        letter-spacing:.3px;
        word-break:break-word;
    ">
        ${user.username || "Not set"}
    </div>

</div>
</div>

    <div class="balanceBig">
    ${window.getPrimaryBalance()} ${window.primaryAsset}
    </div>
   
    <div class="walletActions">
    <div class="walletAction" onclick="openSend()">
    <div class="walletActionIcon">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M12 19V5M12 5L6 11M12 5L18 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
    </div>
    <div class="walletActionLabel">Send</div>
    </div>

    <div class="walletAction" onclick="showReceive()">
    <div class="walletActionIcon">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M12 5V19M12 19L6 13M12 19L18 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
    </div>
    <div class="walletActionLabel">Receive</div>
    </div>

    <div class="walletAction" onclick="openScanner()">
    <div class="walletActionIcon">
    <svg viewBox="0 0 24 24" fill="none">
    <path d="M5 9V6.5C5 6.2 5.2 6 5.5 6H8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M16 6H18.5C18.8 6 19 6.2 19 6.5V9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M5 15V17.5C5 17.8 5.2 18 5.5 18H8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M16 18H18.5C18.8 18 19 17.8 19 17.5V15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <rect x="8" y="8" width="2.2" height="2.2" rx="0.5" fill="currentColor"/>
    <rect x="13.8" y="8" width="2.2" height="2.2" rx="0.5" fill="currentColor"/>
    <rect x="8" y="13.8" width="2.2" height="2.2" rx="0.5" fill="currentColor"/>
    <rect x="13.8" y="13.8" width="2.2" height="2.2" rx="0.5" fill="currentColor"/>
    </svg>
    </div>
    <div class="walletActionLabel">Scan</div>
    </div>
    </div>
    </div>

    <hr>${user.pendingRequest? `<div class="warn"> Pending request under review</div>`: ""}

    <div id="receiveScreen" style="display:none">
    <div class="sendHeader">
    <button onclick="closeReceive()" class="backBtn">←</button>
    <h2 id="receiveTitle" style="display:flex;align-items:center;gap:8px;">
    <span id="receiveText">Receive USDC</span>
    <img id="receiveAssetImg"
         src="./media/usd-coin-usdc-logo.png"
         style="width:20px;height:20px;border-radius:50%;">
</h2>
    </div>
    <div class="sendBody" style="text-align:center">
    <div class="qrWrap"><img id="qrImg"></div>
    <p class="small" style="margin-top:10px">
    Only Send Your Assets To This QR Code.
    </p>
    <div style="margin-top:20px;font-weight:bold;color:var(--subtext)">
    StabiX UID
    </div>
    <div class="addrBox">
    <span id="walletAddr"></span>
    <span onclick="copyWallet()" class="copyIcon">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/>
    <rect x="2" y="2" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/>
    </svg>
    </span>
    </div>
    </div>
    </div>

              <!-- Assets -->
    <hr>
    <div style="
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-top:10px;">
    <h3 style="margin:0;">Assets</h3>
    <div onclick="openAssetSelector()" style="
    width:28px;
    height:28px;
    border-radius:50%;
    background:var(--surface);
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    font-size:18px;">
    +
    </div>
    </div>
    <div style="
    display:flex;
    flex-direction:column;
    gap:10px;
    margin-top:10px;">

                    <!-- USDT -->
    <div style="
    background:var(--bg);
    border:1px solid var(--border);
    border-radius:12px;
    padding:12px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    cursor:pointer;">
    <div style="display:flex;align-items:center;gap:10px;">
    <img 
    src="./media/tether-usdt-logo.png"
    style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
    <div>
    <div style="font-size:14px">USDT</div>
    </div>
    </div>
    <div id="assetUSDTBalance" style="font-weight:bold"> 
    ${Number(window.userData?.usdtBalance || 0).toFixed(2)}
    </div>
    </div>
                 <!-- USDC -->
    <div style="
    background:var(--bg);
    border:1px solid var(--border);
    border-radius:12px;
    padding:12px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    cursor:pointer;">
    <div style="display:flex;align-items:center;gap:10px;">
    <img 
    src="./media/usd-coin-usdc-logo.png"
    style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
    <div>
    <div style="font-size:14px">USDC</div>
    </div>
    </div>
    <div id="assetUSDCBalance" style="font-weight:bold">
    ${Number(window.userData?.balance || 0).toFixed(2)}
    </div>
    </div>   

               <!-- Asset Selector -->
    <div id="assetSelector" style="
    display:none;
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background:var(--bg);
    z-index:999;
    padding:20px;
    box-sizing:border-box;
    ">
    <h2 style="margin-bottom:20px;">Select Primary Asset</h2>

    <div onclick="closeAssetSelector()" style="
    position:absolute;
    top:15px;
    right:15px;
    font-size:22px;
    cursor:pointer;">
    ✕
    </div>

              <!-- USDT -->
    <div onclick="confirmPrimary('USDT')" style="
    background:var(--bg);
    border:1px solid var(--border);
    border-radius:12px;
    padding:12px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    cursor:pointer;
    margin-bottom:10px;
    ">
    <div style="display:flex;align-items:center;gap:10px;">
    <img src="./media/tether-usdt-logo.png" style="width:32px;height:32px;border-radius:50%;">
    <div>
    <div style="font-size:14px">USDT</div>
    ${window.primaryAsset === "USDT" ? `
    <div style="
    font-size:12px;
    color:var(--success);
    font-weight:600;
    margin-top:2px;
    ">Primary</div>
    ` : ``}
    </div>
    </div>
    <div id="selectorUSDTBalance" style="font-weight:bold"> 
    ${Number(window.userData?.usdtBalance || 0).toFixed(2)}
    </div>
    </div>

              <!-- USDC -->
    <div onclick="confirmPrimary('USDC')" style="
    background:var(--bg);
    border:1px solid var(--border);
    border-radius:12px;
    padding:12px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    cursor:pointer;
    ">
    <div style="display:flex;align-items:center;gap:10px;">
    <img src="./media/usd-coin-usdc-logo.png" style="width:32px;height:32px;border-radius:50%;">
    <div>
    <div style="font-size:14px">USDC</div>
    ${window.primaryAsset === "USDC" ? `
    <div style="
    font-size:12px;
    color:var(--success);
    font-weight:600;
    margin-top:2px;
    ">Primary</div>
    ` : ``}
    </div>
    </div>
    <div id="selectorUSDCBalance" style="font-weight:bold">
    ${Number(window.userData?.balance || 0).toFixed(2)}
    </div>
    </div>

    <div id="confirmBox" style="
    display:none;
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background:rgba(0,0,0,0.5);
    z-index:1000;
    align-items:center;
    justify-content:center;">

    <div style="
    background:var(--bg);
    border:1px solid var(--border);
    border-radius:12px;
    padding:20px;
    width:80%;
    text-align:center;">
    <div id="confirmText" style="margin-bottom:20px;">
    Set as primary?
    </div>

    <div style="display:flex;gap:10px;">
    <button onclick="applyPrimary()" style="
    flex:1;
    padding:10px;
    background:var(--success);
    border:none;
    border-radius:8px;
    color:var(--text);
    ">Yes</button>

    <button onclick="closeConfirm()" style="
    flex:1;
    padding:10px;
    background:#ef4444;
    border:none;
    border-radius:8px;
    color:var(--text);
    ">No</button>
    </div>
    </div>
    </div>
    </div>

    <div id="dwSection" style="display:none;">
    <hr>
    <h3>Deposit / Withdraw</h3>
    <div style="
    display:flex;
    gap:10px;
    margin-top:10px;">
    <button onclick="openDeposit()" style="background:var(--success);color:var(--bg);font-weight:bold">
    Deposit
    </button>
    <button onclick="openWithdraw()" style="background:var(--danger);color:var(--text);font-weight:bold">
    Withdraw
    </button>
    </div>
    <div id="depositBox" style="
    display:none;
    margin-top:10px;
    padding:10px;
    background:var(--bg);
    border:1px solid #1e293b;
    border-radius:12px;">
    <select id="networkSelect" onchange="showVault()">
    <option value="">Select Network</option>
    <option value="sepolia">Ethereum (Sepolia)</option>
    </select>
    <div id="vaultSection" style="display:none;margin-top:10px">
    <div class="small">Vault Address:</div>
    <div style="display:flex;align-items:center;gap:8px;width:100%">
    <span style="
    color:var(--primary);
    font-size:12px;
    word-break:break-all;
    flex:1;">
    0x710c5D40a97123903b7cB482dBe39EB35D52af0a
    </span>
    <button onclick="copyVault()" style="
    width:auto;
    padding:6px 10px;
    font-size:12px;
    flex-shrink:0;">
    Copy
    </button>
    </div>

    <button onclick="showDepositForm()" style="background:var(--success);color:var(--bg);font-weight:bold">
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
    background:var(--bg);
    border:1px solid var(--border);
    padding:10px;
    border-radius:8px;
    margin-top:6px;
    word-break:break-all;">
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
    onchange="loadHistoryByDate()"/>
    <div id="history">Loading...</div>
    </div>
    ${isVALIDATOR ? validatorPanel() : ""}

    <div id="previewScreen" style="
    display:none;
    position:fixed;
    top:0;
    left:0;
    width:100vw;
    height:100vh;
    background:var(--bg);
    z-index:9999;
    overflow:auto;">
    <div style="width:100%; max-width:380px; margin:0 auto;">
    <div class="sendHeader">
    <button onclick="closePreview()" class="backBtn">←</button>
    <h2 id="previewTitle" style="display:flex;align-items:center;gap:8px;justify-content:center;">
    <span id="previewText">Send ${window.primaryAsset}</span>
    <img id="previewAssetImg"
    src="${window.primaryAsset === 'USDT' 
    ? './media/tether-usdt-logo.png' 
    : './media/usd-coin-usdc-logo.png'}"
    style="width:20px;height:20px;border-radius:50%;">
    </h2>
    </div>
    <div class="sendBody">
    <h1 class="sendTitle">Receiving StabiX UID</h1>
    <div class="addressBox">
    <input id="previewId" readonly />
    </div>
    <button class="nextBtn" onclick="confirmReceiver()">
    Confirm
    </button>
    <div class="sendHint">
    <div class="hintTitle">
    Instructions
    </div>
    <div class="hintLine">
    • Verify Recipient Scanned StabiX UID before confirming.
    </div>
    <div class="hintLine">
    • Once Confirmed, Proceed To Enter The Transfer Amount.
    </div>
    </div>
    </div>
`);
await window.syncWalletBalances();
window.updateBalanceUI();
document.getElementById("bottomNav").style.display = "flex";
selectTab("home");
listenNotifications();
  
if(window.keepAssetOpen){
  window.keepAssetOpen = false;
  openAssetSelector();
}

       // RECEIVE POPUP
try {
const response = await fetch(
apiUrl(`/api/transactions/history/${WALLET}`),
{
headers: {
        Authorization: `Bearer ${window.getToken()}`
      }
    }
  );

  const data = await response.json();

  if (response.ok && data.transactions.length > 0) {

    const t = data.transactions[0];

  }

} catch (e) {

  console.log("Receive popup error", e);

}
}

 /*=============Open Selector ========*/
window.openAssetSelector = async function(){

document.getElementById("assetSelector").style.display = "block";
    document.getElementById("bottomNav").style.display = "none";

    await window.syncWalletBalances();

    const selectorUsdtEl =
        document.getElementById("selectorUSDTBalance");

    const selectorUsdcEl =
        document.getElementById("selectorUSDCBalance");

    if (selectorUsdtEl) {
        selectorUsdtEl.textContent =
            Number(window.userData?.usdtBalance || 0).toFixed(2);
    }

    if (selectorUsdcEl) {
        selectorUsdcEl.textContent =
            Number(window.userData?.balance || 0).toFixed(2);
    }
};

window.closeAssetSelector = function(){
document.getElementById("assetSelector").style.display = "none";
document.getElementById("bottomNav").style.display = "flex";
}

window.selectedAsset = null;
window.confirmPrimary = function(asset){
if(asset === window.primaryAsset){
return;
}
  
window.selectedAsset = asset;
document.getElementById("confirmText").innerText =
"Set " + asset + " as primary?";
document.getElementById("confirmBox").style.display = "flex";
}

window.closeConfirm = function(){
document.getElementById("confirmBox").style.display = "none";
}

window.applyPrimary = function(){
window.primaryAsset = window.selectedAsset;
localStorage.setItem("primaryAsset", window.primaryAsset);
document.getElementById("confirmBox").style.display = "none";
window.keepAssetOpen = true;
renderApp();
}

 /*=============Primary Balance ========*/
window.getPrimaryBalance = function () {

    if (window.primaryAsset === "USDT") {
        return Number(window.userData?.usdtBalance || 0).toFixed(2);
    }

    if (window.primaryAsset === "USDC") {
        return Number(window.userData?.balance || 0).toFixed(2);
    }

    return "0.00";
};

window.updateBalanceUI = function(){

    const balanceEl = document.querySelector(".balanceBig");

    if (!balanceEl) return;

    balanceEl.textContent =
        `${window.getPrimaryBalance()} ${window.primaryAsset}`;
};
 /*=============UI Interface Of Balance Name ========*/
window.toggleProfile = ()=>{
const box = document.getElementById("profileHidden")
if(box.style.display === "block"){
box.style.display = "none"
}else{
box.style.display = "block"
}
}
window.showReceive = ()=>{
const wallet = window.getCurrentUserId();
  const asset = window.primaryAsset;

document.getElementById("receiveText").innerText = "Receive " + asset;

document.getElementById("receiveAssetImg").src =
  asset === "USDT"
    ? "./media/tether-usdt-logo.png"
    : "./media/usd-coin-usdc-logo.png";
const qrData = JSON.stringify({
type: "stabix",
id: wallet,
})
const qr = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodeURIComponent(qrData)
document.getElementById("qrImg").src = qr
document.getElementById("walletAddr").innerText = wallet
document.getElementById("receiveScreen").style.display = "flex"
document.getElementById("sendScreen").style.display = "none"
document.getElementById("amountScreen").style.display = "none"
document.getElementById("confirmScreen").style.display = "none"
}
window.closeReceive = ()=>{
document.getElementById("receiveScreen").style.display = "none"
}
window.copyWallet = ()=>{
navigator.clipboard.writeText(WALLET)
}

  // ================= EOA WALLET =================
window.editEOA = async ()=>{
const current = window.userData?.eoa_address || "";
const addr = prompt(
"Enter your EOA Wallet Address",
current || ""
);
if(!addr) return;
const newAddr = addr.trim();

const isEVM = /^0x[a-fA-F0-9]{40}$/.test(newAddr);
const isTron = /^T[A-Za-z1-9]{33}$/.test(newAddr);

if (!isEVM && !isTron) {
    alert("Please enter a valid wallet address.");
    return;
}

if (current && current.toLowerCase() === newAddr.toLowerCase()) {
    alert("This wallet address is already linked.");
    return;
}

const response = await fetch(
  apiUrl("/api/users/eoa-address"),
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${window.getToken()}`
    },
    body: JSON.stringify({
      stbx_uid: window.getCurrentUserId(),
      eoa_address: newAddr
    })
  }
);

const data = await response.json();

if (!response.ok) {
  alert(data.message);
  return;
}

alert(data.message);
window.userData.eoa_address = newAddr;

await renderApp();
};

  // ================= Change Username=================
window.changeUsername = async () => {

   const data = window.userData || {};

const current = data.username || "";

    if (data.lastUsernameChange) {

        const last = data.lastUsernameChange.toDate
            ? data.lastUsernameChange.toDate().getTime()
            : new Date(data.lastUsernameChange).getTime();

        const limit = 14 * 24 * 60 * 60 * 1000;

        if (Date.now() - last < limit) {

            const left = Math.ceil(
                (limit - (Date.now() - last)) / 86400000
            );

            alert(
                "Username can only be changed once every 14 days.\n\nRemaining: " +
                left +
                " day(s)."
            );

            return;
        }
    }

    const username = prompt(
        "Enter your new username",
        current
    );

    if (!username) return;

    const newName = username.trim();

    if (newName === current) {
        alert("This is already your current username.");
        return;
    }

    if (!/^[A-Za-z0-9_]{3,20}$/.test(newName)) {
        alert(
            "Username must be 3-20 characters and contain only letters, numbers and underscore (_)."
        );
        return;
    }

    const response = await fetch(
  apiUrl("/api/users/username"),
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${window.getToken()}`
    },
    body: JSON.stringify({
      stbx_uid: window.getCurrentUserId(),
      new_username: newName
    })
  }
);

const result = await response.json();

if (!response.ok) {
  alert(result.message);
  return;
}

alert(result.message);

window.userData.username = newName;
window.userData.lastUsernameChange = new Date();

await renderApp();

return;

};
