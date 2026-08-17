window.renderHistory = function (transactions, emptyText) {

  let groups = {};

  transactions.forEach((t) => {

    if (window.filters.type) {
      if (t.type !== window.filters.type) return;
    }

    if (window.filters.asset) {
      if (t.asset !== window.filters.asset) return;
    }

    if (window.filters.date) {
      let d = new Date(t.created_at).toISOString().slice(0, 10);
      if (d !== window.filters.date) return;
    }

    if (window.filters?.fromDate && window.filters?.toDate) {
      let d = new Date(t.created_at).toISOString().slice(0, 10);

      if (
        d < window.filters.fromDate ||
        d > window.filters.toDate
      ) {
        return;
      }
    }

    if (
      window.filters.minAmount != null ||
      window.filters.maxAmount != null
    ) {

      const amt = Number(t.amount);

      if (
        (window.filters.minAmount != null &&
          amt < window.filters.minAmount) ||

        (window.filters.maxAmount != null &&
          amt > window.filters.maxAmount)
      ) {
        return;
      }

    }

    if (!t.created_at) return;

    const date = new Date(t.created_at);

    const monthKey = date.toLocaleString("en-IN", {
      month: "long",
      year: "numeric"
    });

    if (!groups[monthKey]) groups[monthKey] = [];

    groups[monthKey].push({
      ...t,
      id: t.STRId,
      _time: new Date(t.created_at).getTime()
    });

  });

  let html = "";

  Object.keys(groups)
    .sort((a, b) => groups[b][0]._time - groups[a][0]._time)
    .forEach(month => {

      groups[month].sort((a, b) => b._time - a._time);

      html += `
<div style="margin-top:16px;margin-bottom:6px;font-weight:700;font-size:18px;color:#cbd5f5;">
${month}
</div>
`;

      groups[month].forEach(t => {

        const isCredit =
          t.type === "received" ||
          t.type === "deposit";

        const color = isCredit
          ? "var(--success)"
          : "var(--danger)";

        const dateStr = new Date(
          t.created_at
        ).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"
        });

        let label = "Sent";

        if (t.type === "received") label = "Received";
        if (t.type === "deposit") label = "Deposit";
        if (t.type === "withdraw") label = "Withdraw";

        let userId = t.counterparty;

        if (t.type === "deposit") userId = "Deposit";
        if (t.type === "withdraw") userId = "Withdraw";
        if (!userId) userId = "System";

        const displayAmount = Number(t.amount).toFixed(2);

        html += `
<div onclick="openTxDetail('${t.STRId}')" style="
display:flex;
justify-content:space-between;
align-items:center;
padding:12px 0;
border-bottom:1px solid var(--border);
cursor:pointer;">

<div style="display:flex;gap:10px;align-items:center">

<img
src="${t.asset === "USDT"
? "./media/tether-usdt-logo.png"
: "./media/usd-coin-usdc-logo.png"}"

style="
width:34px;
height:34px;
border-radius:50%;
background:var(--surface);
padding:4px;
border:1px solid var(--border);">

<div>

<div style="font-weight:600;font-size:14px">
${userId}
</div>

<div style="font-size:11px;opacity:.6">
${dateStr}
</div>

</div>

</div>

<div style="text-align:right">

<div style="
font-size:11px;
padding:3px 8px;
border-radius:999px;
display:inline-block;
background:color-mix(in srgb,var(--success) 10%,transparent);
color:${color};">

${label}

</div>

<div style="
margin-top:4px;
font-weight:bold;
color:${color};
font-size:15px;">

${isCredit ? "+" : "-"} ${displayAmount} ${t.asset}

</div>

</div>

</div>
`;

      });

    });

  document.getElementById("history").innerHTML =
    html || `<span class="small">${emptyText}</span>`;

};