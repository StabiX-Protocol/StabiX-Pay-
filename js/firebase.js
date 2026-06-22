import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  where,
  orderBy,
  runTransaction,
  Timestamp,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
/* ================= FIREBASE ================= */
const firebaseConfig = {
apiKey: "AIzaSyBNs4efcfPoHYk13cU8xuCdnTHOXL1yzT4",
authDomain: "stabix-backend-v1.firebaseapp.com",
projectId: "stabix-backend-v1",
storageBucket: "stabix-backend-v1.firebasestorage.app",
messagingSenderId: "351361221507",
appId: "1:351361221507:web:ebaf0d15e86d4b184c6cb6"
};

const appFB = initializeApp(firebaseConfig);
window.db = getFirestore(appFB);
window.rtdb = getDatabase(appFB);
enableIndexedDbPersistence(db).catch(()=>{});

window.doc = doc;
window.setDoc = setDoc;
window.getDoc = getDoc;
window.updateDoc = updateDoc;
window.collection = collection;
window.addDoc = addDoc;
window.getDocs = getDocs;
window.serverTimestamp = serverTimestamp;
window.query = query;
window.where = where;
window.orderBy = orderBy;
window.runTransaction = runTransaction;
window.Timestamp = Timestamp;

// BLOCK NORMAL BROWSER ACCESS (ONLY TELEGRAM ALLOWED)
if (
  !window.Telegram ||
  !window.Telegram.WebApp ||
  !window.Telegram.WebApp.initDataUnsafe ||
  !window.Telegram.WebApp.initDataUnsafe.user
) {
  document.body.innerHTML = `
  <div style="
  background:#020617;
  color:#e5e7eb;
  height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  text-align:center;
  font-family:Arial;
  padding:20px;">
  <div>
  <h2>⚠️ Access Denied</h2>
  <p>This app works only inside Telegram.</p>
  <p class="small">Please open it from the official Telegram bot.</p>
  </div>
  </div>
  `;
  throw new Error("Not opened inside Telegram");
}
