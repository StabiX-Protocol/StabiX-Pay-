type BalanceCardProps = {
  balance?: number;
  asset?: string;
};

export default function BalanceCard({
  balance = 0,
  asset = "USDC",
}: BalanceCardProps) {
  return (
    <section className="px-5 pt-3">
      <div className="rounded-3xl bg-[#111827] p-6 text-white shadow-lg">
        <p className="text-sm text-gray-300">
          Total Balance
        </p>

        <h2 className="mt-2 text-4xl font-bold tracking-tight">
          ${balance.toFixed(2)}
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          {asset}
        </p>
      </div>
    </section>
  );
}