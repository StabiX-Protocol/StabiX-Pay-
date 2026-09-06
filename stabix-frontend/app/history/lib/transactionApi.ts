import type { Transaction } from "./historyApi";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "";

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
}

export async function getTransactionBySTRId(
  STRId: string
): Promise<Transaction> {
  const response = await fetch(
    `${API_URL}/api/transactions/${encodeURIComponent(
      STRId
    )}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Transaction not found"
    );
  }

  return data.transaction;
}