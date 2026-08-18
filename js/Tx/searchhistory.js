window.setupHistorySearch = () => {

  const input = document.getElementById("searchInput");

  if (!input) return;

  input.addEventListener("input", async (e) => {

    const val = e.target.value.trim();

    try {

      if (!val) {

        await window.loadHistoryByDate();
        return;

      }

      const response = await fetch(
        `http://10.148.199.19:3000/api/transactions/search/${window.getCurrentUserId()}?q=${encodeURIComponent(val)}`,
        {
          headers: {
            Authorization: `Bearer ${window.getToken()}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {

        console.error("Search API error:", data);

        window.renderHistory(
          [],
          "No results"
        );

        return;
      }

      const transactions = data.transactions || [];

      window.renderHistory(
        transactions,
        "No results"
      );

    } catch (err) {

      console.error("Transaction search error:", err);

      window.renderHistory(
        [],
        "No results"
      );

    }

  });

};