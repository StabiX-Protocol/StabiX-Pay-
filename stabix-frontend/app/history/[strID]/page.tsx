"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import TransactionDetail from "../components/TransactionDetails";
import { getTransactionBySTRId } from "../lib/transactionApi";

import type { Transaction } from "../lib/historyApi";

export default function TransactionDetailPage() {
  const params = useParams();

  const strID = params.strID as string;

  const [transaction, setTransaction] =
    useState<Transaction | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  useEffect(() => {
    async function loadTransaction() {
      try {
        const data =
          await getTransactionBySTRId(strID);

        setTransaction(data);
      } catch (error) {
        console.error(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (strID) {
      loadTransaction();
    }
  }, [strID]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="px-4 py-8 text-center text-sm text-muted">
          Loading transaction...
        </div>
      </main>
    );
  }

  if (error || !transaction) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="px-4 py-8 text-center text-sm text-muted">
          Transaction not found
        </div>
      </main>
    );
  }

  return (
    <TransactionDetail
      transaction={transaction}
    />
  );
}