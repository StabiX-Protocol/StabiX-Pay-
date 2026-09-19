"use client";

import { ComponentProps, useEffect, useState } from "react";
import { useParams,useRouter,useSearchParams, } from "next/navigation";

import TransactionDetail from "../components/TransactionDetails";
import { getTransactionBySTRId } from "../lib/transactionApi";

import type { Transaction } from "../lib/historyApi";

export default function TransactionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const userUid = searchParams.get("user");

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

  const normalizedTransaction: ComponentProps<typeof TransactionDetail>["transaction"] | null =
    transaction
      ? {
          ...transaction,
          stbx_uid: transaction.stbx_uid ?? undefined,
        }
      : null;

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="px-4 py-8 text-center text-sm text-muted">
          Loading transaction...
        </div>
      </main>
    );
  }

  if (error || !normalizedTransaction) {
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
      transaction={normalizedTransaction}
    />
  );
}