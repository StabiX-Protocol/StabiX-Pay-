window.setupHistorySearch = () => {

  const input = document.getElementById("searchInput");

  if (!input) return;

  input.oninput = async (e) => {

    const q = e.target.value.trim();

    try {

      if (!q) {
        await loadHistoryByDate();
        return;
      }

      const response = await fetch(
        `http://10.148.199.19:3000/api/transactions/search/${window.getCurrentUserId()}?q=${encodeURIComponent(q)}`,
        {
          headers: {
            Authorization: `Bearer ${window.getToken()}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        window.renderHistory([], "No results");
        return;
      }

      window.renderHistory(
        data.transactions || [],
        "No results"
      );

    } catch (err) {

      console.error("Transaction search error:", err);

      window.renderHistory([], "No results");
    }
  };
};