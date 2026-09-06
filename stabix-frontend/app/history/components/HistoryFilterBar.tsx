"use client";

import type { HistoryFilterType } from "../lib/historyFilters";

type HistoryFilterBarProps = {
  onOpenFilter: (type: HistoryFilterType) => void;
};

export default function HistoryFilterBar({
  onOpenFilter,
}: HistoryFilterBarProps) {
  return (
    <div className="my-3 flex gap-2">
      <button
        type="button"
        onClick={() => onOpenFilter("date")}
        className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold"
      >
        Date ▼
      </button>

      <button
        type="button"
        onClick={() => onOpenFilter("asset")}
        className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold"
      >
        Asset ▼
      </button>

      <button
        type="button"
        onClick={() => onOpenFilter("amount")}
        className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold"
      >
        Amount ▼
      </button>

      <button
        type="button"
        onClick={() => onOpenFilter("type")}
        className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold"
      >
        Type ▼
      </button>
    </div>
  );
}