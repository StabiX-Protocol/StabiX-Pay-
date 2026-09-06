"use client";

type TypeFilterProps = {
  currentType: string | null;
  onApply: (type: string | null) => void;
  onClear: () => void;
  onClose: () => void;
};

export default function TypeFilter({
  currentType,
  onApply,
  onClear,
  onClose,
}: TypeFilterProps) {
  const types = [
    { value: "sent", label: "Sent" },
    { value: "received", label: "Received" },
    { value: "deposit", label: "Deposit" },
    { value: "withdraw", label: "Withdraw" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40">
      <div className="w-full rounded-t-3xl bg-[var(--surface)] p-5">

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            Type
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
          {types.map((type) => {
            const selected = currentType === type.value;

            return (
              <button
                key={type.value}
                type="button"
                onClick={() => onApply(type.value)}
                className={`w-full rounded-xl border p-3 text-left font-semibold ${
                  selected
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
                    : "border-[var(--border)]"
                }`}
              >
                {type.label}
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