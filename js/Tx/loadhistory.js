/* ================= HISTORY ================= */

window.loadHistory = async function () {

  try {

    const response = await fetch(
      apiUrl(`/api/transactions/history`),
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

    window.renderHistory(
      data.transactions,
      "No transactions"
    );

  } catch (err) {

    console.log(err);

  }

};

window.loadHistoryByDate = async () => {

  const selected =
    document.getElementById("historyDate")?.value;

  try {

    const response = await fetch(
      apiUrl(`/api/transactions/history`),
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

    if (selected) {

      transactions = transactions.filter((t) => {

        const d = new Date(t.created_at)
          .toISOString()
          .slice(0, 10);

        return d === selected;

      });

    }

    window.renderHistory(
      transactions,
      selected
        ? "No transactions for this date"
        : "No transactions"
    );

  } catch (err) {

    console.log(err);

  }

};