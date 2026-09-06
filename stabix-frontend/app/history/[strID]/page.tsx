import { notFound } from "next/navigation";

import TransactionDetail from "../components/TransactionDetails";
import { getTransactionBySTRId } from "../lib/transactionApi";

type TransactionDetailPageProps = {
  params: Promise<{
    strId: string;
  }>;
};

export default async function TransactionDetailPage({
  params,
}: TransactionDetailPageProps) {
  const { strId } = await params;

  try {
    const transaction =
      await getTransactionBySTRId(strId);

    return (
      <TransactionDetail
        transaction={transaction}
      />
    );
  } catch {
    notFound();
  }
}