/* ================= Navigation ================= */
window.navigateHome = async () => {
try {
await renderApp();
const send = document.getElementById("sendScreen");
const amount = document.getElementById("amountScreen");
const confirm = document.getElementById("confirmScreen");
if (send) send.style.display = "none";
if (amount) amount.style.display = "none";
if (confirm) confirm.style.display = "none";
selectTab("home");
} catch (e) {
console.log("navigateHome error:", e);
}
};
