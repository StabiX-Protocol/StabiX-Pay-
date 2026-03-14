/* ================= TELEGRAM ================= */
const tg = window.Telegram.WebApp;
tg.ready(); tg.expand();
const tgUser = tg.initDataUnsafe?.user;
if(!tgUser?.id){ document.getElementById("app").innerHTML="Telegram user not found"; throw ""; }

