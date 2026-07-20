// ================== Instant Mode Flow ==================
window.selectMode = function(mode){
let title = mode === "instant" ? "Notice" : "Self Custody Warning";
let message = mode === "instant"
? "In Instant mode, deposits are credited to a StabiX managed execution layer where funds are maintained within system-controlled hot wallets. User balances are handled internally, enabling fast settlement without repeated on-chain interactions. Withdrawals are executed directly by the backend."
: "In Advanced mode, all funds remain on-chain under your control. Deposits and withdrawals happen via smart contracts. Withdrawals use Merkle proofs and batching. You are fully responsible for your funds — StabiX does not control them.";
if(confirm(title + "\n\n" + message)){
window.MODE = mode;
document.getElementById("instantBtn").style.border = "1px solid rgba(255,255,255,0.08)";
document.getElementById("advancedBtn").style.border = "1px solid rgba(255,255,255,0.08)";
document.getElementById(mode + "Btn").style.border = "1px solid #3b82f6";
} else {
return;
}
};

window.handleDepositClick = function(asset){
if(!window.MODE){
alert("Select mode first");
return;
}

if(window.MODE === "instant"){
openInstantDeposit(asset);
}else{
openDeposit(asset); 
}
}
window.handleWithdrawClick = function(asset){
if(!window.MODE){
alert("Select mode first");
return;
}
if(window.MODE === "instant"){
openInstantWithdraw(asset);
}else{
openWithdrawNetwork(asset); 
}
}
