window.openBusiness = function(){
appDiv(`
<div class="business-page">
<div class="topBar">
<div class="backBtn" onclick="renderApp()">
←
</div>
<div class="pageTitle">
Business
</div>
</div>

<div class="businessHero">
<h1>Grow Your Business</h1>
<p>
Grow your business with stablecoin payments. Integrate your app, website, or game with StabiX to accept payments, manage transactions, access analytics, and use powerful business tools.
</p>
</div>

<button class="createBusinessBtn"
onclick="openBusinessRegistration()">
Create Business Account
</button>
</div>
`);
};

window.openBusinessRegistration = function(){

alert("Business Registration");

}
