import { loadHistoryByDate } from "./historyApi";
import type { Transaction } from "./historyApi";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "";

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
}

export async function searchHistory(
  query: string
): Promise<Transaction[]> {
  const q = query.trim();

  /*
   * Legacy behavior:
   * Agar search empty hai,
   * normal history load hoti hai.
   */
  if (!q) {
    return loadHistoryByDate();
  }

  const response = await fetch(
    `${API_URL}/api/transactions/search?q=${encodeURIComponent(
      q
    )}&_=${Date.now()}`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  const data = await response.json();

  const transactions = Array.isArray(
    data.transactions
  )
    ? data.transactions
    : [];

  return transactions;
}