async function generateSTR(){

  const systemRef = doc(db, "settings", "system");

  return await runTransaction(db, async (tx)=>{

    const snap = await tx.get(systemRef);

    const nextSTR = snap.data().nextSTR || 1;

    tx.update(systemRef,{
      nextSTR: nextSTR + 1
    });

    const random = Math.floor(1000000000 + Math.random() * 9000000000);

    return "STR" + "10" + random.toString();
  });

}
window.generateSTR = generateSTR;

import {
  ref,
  push,
  set,
  get
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

async function updateLiveFeed(txData){

  const liveRef = ref(window.rtdb, "liveFeed");
  const statsRef = ref(window.rtdb, "stats");

  await push(liveRef, {
    str: txData.str,
    amount: txData.amount,
    asset: txData.asset,
    time: new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    })
  });

  const statsSnap = await get(statsRef);
  const stats = statsSnap.exists() ? statsSnap.val() : {};

  await set(statsRef,{
    totalTx: (stats.totalTx || 0) + 1,
    totalVolume: (stats.totalVolume || 0) + Number(txData.amount || 0)
  });

}
