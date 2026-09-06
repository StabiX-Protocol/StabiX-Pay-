export type Transaction = {
  STRId: string;
  type: "sent" | "received" | "deposit" | "withdraw";
  status?: string;
  asset: string;
  amount: string | number;
  counterparty?: string | null;
  created_at: string;
};

type HistoryResponse = {
  transactions: Transaction[];
  message?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "";

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("jwt_token");
}

export async function loadHistory(): Promise<Transaction[]> {
  const response = await fetch(
    `${API_URL}/api/transactions/history`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  const data: HistoryResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load history"
    );
  }

  return data.transactions;
}

export async function loadHistoryByDate(
  selected?: string
): Promise<Transaction[]> {
  const transactions = await loadHistory();

  if (!selected) {
    return transactions;
  }

  return transactions.filter((t) => {
    const date = new Date(t.created_at)
      .toISOString()
      .slice(0, 10);

    return date === selected;
  });
}