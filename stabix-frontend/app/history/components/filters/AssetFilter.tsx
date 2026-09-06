"use client";

type AssetFilterProps = {
  currentAsset: string | null;
  onApply: (asset: string | null) => void;
  onClear: () => void;
  onClose: () => void;
};

export default function AssetFilter({
  currentAsset,
  onApply,
  onClear,
  onClose,
}: AssetFilterProps) {
  const assets = ["USDT", "USDC"];

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40">
      <div className="w-full rounded-t-3xl bg-[var(--surface)] p-5">

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            Asset
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-[var(--muted)]"
          >
            ×
          </button>
        </div>

        <div className="mb-5 space-y-2">
          {assets.map((asset) => (
            <button
              key={asset}
              type="button"
              onClick={() => onApply(asset)}
              className={`flex w-full items-center rounded-xl border p-3 text-left font-semibold ${
                currentAsset === asset
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
                  : "border-[var(--border)]"
              }`}
            >
              <img
                src={
                  asset === "USDT"
                    ? "/media/tether-usdt-logo.png"
                    : "/media/usd-coin-usdc-logo.png"
                }
                alt={asset}
                className="mr-3 h-9 w-9 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1"
              />

              {asset}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClear}
            className="flex-1 rounded-xl border border-[var(--border)] p-3 font-semibold"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-blue-600 p-3 font-semibold text-white"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}