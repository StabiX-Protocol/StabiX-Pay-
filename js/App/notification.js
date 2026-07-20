/* ================= Notifications ================= */
window.openNotifications = async () => {
document.getElementById("bottomNav").style.display = "none";
const q = query(
collection(db, "notifications"),
where("to", "==", WALLET)
);
const snap = await getDocs(q);
const docs = snap.docs.sort((a, b) => {
return b.data().time?.seconds - a.data().time?.seconds;
});
const now = Date.now();
const docsFiltered = docs.filter(docSnap => {
const d = docSnap.data();
if(!d.time) return false;
const t = d.time.seconds * 1000;
const unreadLimit = 7 * 24 * 60 * 60 * 1000; // 7 days
const readLimit = 3 * 24 * 60 * 60 * 1000;   // 3 days
if(d.read){
return (now - t) < readLimit;
} else {
return (now - t) < unreadLimit;
}
});
let html = `
<div style="background:var(--bg);min-height:100vh;padding:16px">
<div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
<span onclick="renderApp()" style="cursor:pointer;font-size:20px">←</span>
<span style="font-weight:bold;font-size:18px">Notifications</span>
</div>
`;

 if (snap.empty) {
html += `<div style="opacity:.6">No notifications</div>`;
}
let lastDate = "";
docsFiltered.forEach(docSnap => {
const d = docSnap.data();
const currentDate = formatRelativeDate(d.time);
if (currentDate !== lastDate) {
html += `
<div style="
margin-top:18px;
margin-bottom:6px;
font-size:17px;
font-weight:700;
color:var(--primary);
letter-spacing:0.3px;">
${currentDate}
</div>
<div style="
height:1px;
background:var(--border);
margin-bottom:10px;">
</div>
`;
lastDate = currentDate;
}
  
html += `
<div onclick="openNotifDetail('${docSnap.id}')"
style="padding:14px 0;border-bottom:1px solid var(--border);cursor:pointer;${!d.read ? 'background:color-mix(in srgb, var(--primary) 8%, transparent);border-left:3px solid var(--primary);padding-left:10px;' : ''}">
<div style="font-weight:600;font-size:15px;margin-bottom:4px">
<span style="${!d.read ? 'font-weight:700' : 'font-weight:600'}">
${d.title || "Notification"}
</span>
</div>
<div style="font-size:12px;opacity:.5">
${formatTime(d.time)}
</div>
</div>
`;
});
html += `</div>`;
appDiv(html);
};

window.listenNotifications = async function(){
const q = query(
collection(db, "notifications"),
where("to", "==", WALLET)
);
const snap = await getDocs(q);
const now = Date.now();
const count = snap.docs.filter(docSnap => {
const d = docSnap.data();
if(!d.time) return false;
if(d.read) return false;
const t = d.time.seconds * 1000;
const unreadLimit = 7 * 24 * 60 * 60 * 1000;
return (now - t) < unreadLimit;
}).length;
updateNotif(count);
};

function updateNotif(count){
const el = document.getElementById("notifCount");
if(!el) return;
if(count === 0){
el.style.display = "none"; 
} else {
el.style.display = "flex";
el.innerText = count; 
}
}

window.closeNotifications = () => {
document.getElementById("notifScreen").style.display = "none";
renderApp();
};

function formatTime(ts){
if(!ts) return "";
const date = new Date(ts.seconds * 1000);
return date.toLocaleString("en-IN", {
hour: "2-digit",
minute: "2-digit"
});
}

function formatDate(ts){
if(!ts) return "";
const date = new Date(ts.seconds * 1000);
return date.toLocaleDateString("en-IN", {
day: "2-digit",
month: "short"
});
}

function formatDateGroup(ts){
if(!ts) return "";
const date = new Date(ts.seconds * 1000);
return date.toLocaleDateString("en-IN", {
day: "2-digit",
month: "long",
year: "numeric"
});
}

function formatRelativeDate(ts){
if(!ts) return "";
const now = new Date();
const date = new Date(ts.seconds * 1000);
const diffTime = now - date;
const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
if(diffDays === 0) return "Today";
if(diffDays === 1) return "Yesterday";
if(diffDays === 2) return "2 days ago";
if(diffDays === 3) return "3 days ago";
return date.toLocaleDateString("en-IN", {
day: "2-digit",
month: "short",
year: "numeric"
});
}

window.openNotifDetail = async (id) => {
const docRef = doc(db, "notifications", id);
await updateDoc(docRef, { read: true });
const snap = await getDoc(docRef);
if(!snap.exists()) return;
const d = snap.data();
let html = `
<div style="
background:var(--bg);
min-height:100vh;
padding:16px;">
<div style="
display:flex;
align-items:center;
gap:10px;
margin-bottom:20px;">

<span onclick="openNotifications()" style="
cursor:pointer;
font-size:20px;
">←</span>
<span style="
font-weight:bold;
font-size:18px;">
Notification
</span>
</div>
<div style="
background:var(--surface);
border-radius:16px;
padding:16px;
border:1px solid var(--border);">
<div style="
font-size:17px;
font-weight:bold;
margin-bottom:10px;">
${d.title || "Notification"}
</div>
<div style="
font-size:14px;
line-height:1.5;
opacity:.85;
margin-bottom:15px;
word-break:break-word;">
${d.body || ""}
</div>
<div style="
font-size:12px;
opacity:.5;">
</div>
</div>
</div>
`;
appDiv(html);
};

window.sendValidatorNotification = async () => {
const title = document.getElementById("vTitle").value.trim();
const body = document.getElementById("vBody").value.trim();
if(!title || !body){
alert("Enter title & message");
return;
}
try{
const usersSnap = await getDocs(collection(db,"users"));
usersSnap.forEach(async (u) => {
await addDoc(collection(db,"notifications"),{
to: u.id,
type: "validator",
title,
body,
time: serverTimestamp(),
read: false
});
});
alert("Notification sent to all users ");
document.getElementById("vTitle").value = "";
document.getElementById("vBody").value = "";
}catch(e){
console.log(e);
alert("Error sending notification");
}
};


