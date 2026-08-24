export default function RecentTransactions() {
  return (
    <section className="px-5 pb-8 pt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Recent Transactions
        </h2>

        <button
          type="button"
          className="text-sm font-medium text-gray-500"
        >
          View all
        </button>
      </div>

      <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-gray-500">
          No transactions yet
        </p>
      </div>
    </section>
  );
}