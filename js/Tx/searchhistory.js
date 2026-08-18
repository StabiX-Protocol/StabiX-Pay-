window.setupHistorySearch = () => {

  const input = document.getElementById("searchInput");

  if (!input) return;

  let searchRequestId = 0;

  input.oninput = async (e) => {

    const q = e.target.value.trim();

    const requestId = ++searchRequestId;

    if (!q) {
      await loadHistoryByDate();
      return;
    }

    const historyBox = document.getElementById("history");

    if (historyBox) {
      historyBox.innerHTML =
        `<span class="small">Searching...</span>`;
    }

    try {

      const response = await fetch(
        `http://10.148.199.19:3000/api/transactions/search/${window.getCurrentUserId()}?q=${encodeURIComponent(q)}&_=${Date.now()}`,
        {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${window.getToken()}`
          }
        }
      );

      const data = await response.json();

     
      if (requestId !== searchRequestId) {
        return;
      }

      const transactions = Array.isArray(data.transactions)
        ? data.transactions
        : [];

      window.renderHistory(
        transactions,
        "No results"
      );

    } catch (err) {

      if (requestId !== searchRequestId) {
        return;
      }

      console.error("Transaction search error:", err);

      window.renderHistory([], "No results");
    }
  };
};