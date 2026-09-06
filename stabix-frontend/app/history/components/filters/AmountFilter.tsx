"use client";

type AmountFilterProps = {
  currentMin: number | null;
  currentMax: number | null;
  onApply: (min: number | null, max: number | null) => void;
  onClear: () => void;
  onClose: () => void;
};

export default function AmountFilter({
  currentMin,
  currentMax,
  onApply,
  onClear,
  onClose,
}: AmountFilterProps) {
  const ranges = [
    { label: "0 – 50", min: 0, max: 50 },
    { label: "50 – 500", min: 50, max: 500 },
    { label: "500+", min: 500, max: null },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40">
      <div className="w-full rounded-t-3xl bg-[var(--surface)] p-5">

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            Amount
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-[var(--muted)]"
          >
            ×
          </button>
        </div>

        <div className="space-y-2">
          {ranges.map((range) => {
            const selected =
              currentMin === range.min &&
              currentMax === range.max;

            return (
              <button
                key={range.label}
                type="button"
                onClick={() =>
                  onApply(range.min, range.max)
                }
                className={`w-full rounded-xl border p-3 text-left font-semibold ${
                  selected
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
                    : "border-[var(--border)]"
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex gap-3">
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