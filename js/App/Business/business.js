window.openBusiness = function(){
appDiv(`
<div class="business-page">
<!-- Top Bar -->
<div class="topBar">
<div class="backBtn" onclick="renderApp()">
←
</div>

<div class="pageTitle">
Business
</div>
</div>

<!-- Hero Section -->
<div class="businessHero">
<h1>Grow Your Business</h1>
<p>
Grow your business with stablecoin payments. Integrate your app, website, or game with StabiX to accept payments, manage transactions, access analytics, and use powerful business tools.
</p>
</div>

<!-- Primary Button -->
<button class="createBusinessBtn btn-primary" onclick="openBusinessRegistration()">
Create Business Account
</button>

<!-- Features Grid -->
<div style="
padding: 0 16px 40px 16px;
display: grid;
grid-template-columns: 1fr 1fr;
gap: 16px;
max-width: 420px;
margin: 0 auto;
width: 100%;
">

<!-- Feature 1 -->
<div class="premium-card" style="text-align: center;">
<div style="font-size: 28px; margin-bottom: 12px;">
<svg width="48" height="48" viewBox="0 0 24 24" fill="none">
<rect x="2" y="7" width="20" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/>
<path d="M2 10H22" stroke="currentColor" stroke-width="1.5"/>
<circle cx="18" cy="14" r="1.5" fill="currentColor"/>
</svg>
</div>
<div style="font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px;">Instant Payments</div>
<div style="font-size: 12px; color: var(--subtext); line-height: 1.4;">Accept stablecoin payments instantly</div>
</div>

<!-- Feature 2 -->
<div class="premium-card" style="text-align: center;">
<div style="font-size: 28px; margin-bottom: 12px;">
<svg width="48" height="48" viewBox="0 0 24 24" fill="none">
<path d="M3 20V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
<path d="M9 20V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
<path d="M15 20V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
<path d="M21 20V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>
</div>
<div style="font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px;">Analytics</div>
<div style="font-size: 12px; color: var(--subtext); line-height: 1.4;">Track all transactions in detail</div>
</div>

<!-- Feature 3 -->
<div class="premium-card" style="text-align: center;">
<div style="font-size: 28px; margin-bottom: 12px;">
<svg width="48" height="48" viewBox="0 0 24 24" fill="none">
<circle cx="6" cy="12" r="2" stroke="currentColor" stroke-width="1.5"/>
<circle cx="18" cy="12" r="2" stroke="currentColor" stroke-width="1.5"/>
<path d="M8 12H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>
</div>
<div style="font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px;">Easy Integration</div>
<div style="font-size: 12px; color: var(--subtext); line-height: 1.4;">Integrate in minutes with API</div>
</div>

<!-- Feature 4 -->
<div class="premium-card" style="text-align: center;">
<div style="font-size: 28px; margin-bottom: 12px;">
<svg width="48" height="48" viewBox="0 0 24 24" fill="none">
<path d="M12 2L4 5.5V11C4 17 12 22 12 22C12 22 20 17 20 11V5.5L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
</div>
<div style="font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px;">Secure</div>
<div style="font-size: 12px; color: var(--subtext); line-height: 1.4;">Enterprise-level security</div>
</div>
</div>

<!-- Secondary Button -->
<div style="display:flex;justify-content:center;padding:0 16px 40px;">
<button
class="createBusinessBtn btn-secondary"
onclick="viewDocumentation()"
style="
background:linear-gradient(135deg,rgba(59,130,246,.1) 0%,rgba(59,130,246,.05) 100%);
color:var(--primary);
border:1.5px solid var(--primary);
box-shadow:0 4px 12px rgba(37,99,235,.1);
max-width:320px;
width:100%;
margin:0 auto;
">
View Documentation
</button>
</div>
</div>
`);
document.getElementById("bottomNav").style.display = "none";
};

window.viewDocumentation = function() {
    alert('Documentation coming soon!');
    // Add your documentation link here
};

window.openBusinessRegistration = function () {
appDiv(`
<div class="business-page">
<div class="topBar">
<div class="backBtn" onclick="openBusiness()">←</div>
<div class="pageTitle">Business Registration</div>
<div style="width:40px;"></div>
</div>

<div class="businessForm">
<h2>Register Business</h2>
<p class="businessSub">
Complete the details below to apply for a Business Account.
</p>

<div class="inputGroup">
<label>Business Name</label>
<input
id="businessName"
type="text"
placeholder="Enter business name">
</div>

<div class="inputGroup">
<label>Category</label>
<select id="businessCategory">
<option value="">Select Category</option>
<option>Gaming</option>
<option>E-Commerce</option>
<option>Creator</option>
<option>SaaS</option>
<option>Finance</option>
<option>Other</option>
</select>
</div>

<div class="inputGroup">
<label>Website / Social Link</label>
<input
id="businessWebsite"
type="text"
placeholder="https://">
</div>

<div class="inputGroup">
<label>Business Email</label>
<input
id="businessEmail"
type="email"
placeholder="name@example.com">
</div>

<div class="inputGroup">
<label>Country</label>
<input
id="businessCountry"
type="text"
placeholder="Country">
</div>

<div class="inputGroup">
<label>Description</label>

<textarea
id="businessDescription"
rows="5"
placeholder="Tell us about your business"></textarea>
</div>

<div class="termsBox">
<input
type="checkbox"
id="businessTerms">
<label for="businessTerms">
I agree to the Business Terms.
</label>
</div>

<button
class="createBusinessBtn"
onclick="businessReview()">
Continue
</button>
</div>
</div>
`);
}
