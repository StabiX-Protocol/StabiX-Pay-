window.showTxPopup = (msg,type="success")=>{
if(!window.isSender) return;
const popup = document.getElementById("txPopup")
const title = document.getElementById("txTitle")
const msgBox = document.getElementById("txMsg")
const strBox = document.getElementById("txSTR")
const tick = document.getElementById("tick")
const cross1 = document.getElementById("crossLine1")
const cross2 = document.getElementById("crossLine2")
const ring = document.querySelector(".circle-progress")
const done = document.getElementById("txDoneBtn")
popup.style.display="flex"
msgBox.innerText = msg
 strBox.innerText = window.lastSTRId
  ? `STR ID : ${window.lastSTRId}`
  : "";
done.style.display="none"
const timeBox = document.getElementById("txTime")
if(type==="success"){
const now = new Date()
timeBox.innerText = now.toLocaleString()
}else{
timeBox.innerText=""
}
tick.style.display="none"
cross1.style.display="none"
cross2.style.display="none"
ring.style.animation="none"
ring.offsetHeight
ring.style.animation="progressFill .9s ease forwards"
tick.style.animation="none"
cross1.style.animation="none"
cross2.style.animation="none"
tick.offsetHeight
cross1.offsetHeight
cross2.offsetHeight
  
if(type==="failed"){
title.innerText="Transaction Failed"
title.style.color="var(--danger)"
ring.style.stroke="var(--danger)"
done.style.background="var(--danger)"
done.style.color="var(--text)"
cross1.style.display="block"
cross2.style.display="block"
cross1.style.animation="tickDraw .35s ease forwards"
cross2.style.animation="tickDraw .35s ease forwards"
}
  
else{
title.innerText="Transaction Successful"
title.style.color="var(--success)"
ring.style.stroke="var(--success)"
done.style.background="var(--success)"
done.style.color="var(--bg)"
tick.style.display="block"
tick.style.animation="tickDraw .35s ease forwards"
}
setTimeout(()=>{
done.style.display="block"
},900)
}
