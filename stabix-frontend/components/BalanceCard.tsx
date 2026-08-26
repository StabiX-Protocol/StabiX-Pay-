type BalanceCardProps = {
  balance?: string;
  asset?: string;
};

export default function BalanceCard({
  balance = "0.00",
  asset = "USDC",
}: BalanceCardProps) {
  return (
    <section className="px-5 pt-3">
      <div className="relative overflow-hidden rounded-[30px] bg-black px-6 py-7 shadow-xl dark:bg-white">
        {/* Subtle glow */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/[0.05] blur-2xl dark:bg-black/[0.05]" />

        <div className="relative">
          <p className="text-sm font-medium text-white/55 dark:text-black/50">
            Total Balance
          </p>

          <div className="mt-3 flex items-end gap-2">
            <span className="text-[46px] font-bold leading-none tracking-[-0.04em] text-white dark:text-black">
              {balance}
            </span>

            <span className="mb-1 text-lg font-semibold text-white/60 dark:text-black/55">
              {asset}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}