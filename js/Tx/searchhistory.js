window.setupHistorySearch = () => {

  const input = document.getElementById("searchInput");

  if (!input) return;

  input.addEventListener("input", async (e) => {

    const val = e.target.value.trim();

    try {

      const response = await fetch(
        `http://10.148.199.19:3000/api/transactions/history/${window.getCurrentUserId()}`,
        {
          headers: {
            Authorization: `Bearer ${window.getToken()}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      let transactions = data.transactions;

      if (val) {

        transactions = transactions.filter((t) =>

          (t.counterparty || "")
            .toLowerCase()
            .includes(val.toLowerCase())

        );

      }

      window.renderHistory(
        transactions,
        val ? "No results" : "No transactions"
      );

    } catch (err) {

      console.log(err);

    }

  });

};