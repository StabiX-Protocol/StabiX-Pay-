import Link from "next/link";

const networks = [
  {
    slug: "ethereum",
    name: "Ethereum",
    type: "ERC20",
    speed: "~2 min",
    fee: "$5 fee",
  },
  {
    slug: "arbitrum",
    name: "Arbitrum",
    type: "L2",
    speed: "~10 sec",
    fee: "Low fee",
  },
  {
    slug: "polygon",
    name: "Polygon",
    type: "PoS",
    speed: "~5 sec",
    fee: "Very low",
  },
  {
    slug: "base",
    name: "Base",
    type: "L2",
    speed: "~5 sec",
    fee: "Low fee",
  },
];

export default async function InstantNetworkPage({
  params,
  searchParams,
}: {
  params: Promise<{ asset: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { asset } = await params;
  const { mode } = await searchParams;

  const assetName = asset.toUpperCase();

  const selectedMode =
    mode === "withdraw" ? "withdraw" : "deposit";

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-5 pb-10 text-slate-900 dark:bg-[#0b0b0d] dark:text-white">
      <div className="mx-auto w-full max-w-md">

        {/* Header */}
        <header className="flex items-center gap-3 py-7">

          <Link
            href={`/dw/${asset}`}
            aria-label="Back"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl shadow-sm ring-1 ring-slate-200 transition active:scale-90 dark:bg-[#18181b] dark:ring-white/10"
          >
            ←
          </Link>

          <div>
            <h1 className="text-xl font-bold">
              Select Network
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Instant · {assetName} ·{" "}
              {selectedMode === "deposit"
                ? "Deposit"
                : "Withdraw"}
            </p>
          </div>

        </header>

        {/* Networks */}
        <section className="mt-3">
          <div className="space-y-4">

            {networks.map((network) => (
              <Link
                key={network.slug}
                href={
                  selectedMode === "deposit"
                    ? `/dw/${asset}/instant/deposit?network=${network.slug}`
                    : `/dw/${asset}/instant/withdraw?network=${network.slug}`
                }
                className="block rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition active:scale-[0.985] dark:border-white/10 dark:bg-[#18181b]"
              >
                <div className="flex items-center justify-between">

                  <div>
                    <h2 className="text-xl font-bold">
                      {network.name}{" "}
                      <span className="font-medium text-slate-500 dark:text-slate-400">
                        {network.type}
                      </span>
                    </h2>

                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                      Speed: {network.speed}
                    </p>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Fee: {network.fee}
                    </p>
                  </div>

                  <span className="text-2xl text-slate-500 dark:text-slate-400">
                    →
                  </span>

                </div>
              </Link>
            ))}

          </div>
        </section>

      </div>
    </main>
  );
}