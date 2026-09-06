import type { Transaction } from "./historyApi";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "";

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("jwt_token");
}

export async function searchHistory(
  query: string
): Promise<Transaction[]> {
  const url =
    `${API_URL}/api/transactions/search?q=${encodeURIComponent(query)}&_=${Date.now()}`;

  console.log("SEARCH QUERY:", query);
  console.log("SEARCH URL:", url);
  console.log("TOKEN EXISTS:", !!getToken());

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  console.log("SEARCH STATUS:", response.status);

  const data = await response.json();

  console.log("SEARCH RESPONSE:", data);

  if (!response.ok) {
    throw new Error(
      data.message || "Transaction search failed"
    );
  }

  return Array.isArray(data.transactions)
    ? data.transactions
    : [];
}