window.selectTab = function(tab){
["home","deposit","history","settings"].forEach(t=>{
const el = document.getElementById("tab-"+t);
if(el) el.classList.remove("nav-item-active");
});
const active = document.getElementById("tab-"+tab);
if(active) active.classList.add("nav-item-active");
}
