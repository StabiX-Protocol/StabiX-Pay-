"use client";

import { useState } from "react";

type DateFilterProps = {
  currentDate: string | null;
  currentFromDate: string | null;
  currentToDate: string | null;

  onApply: (
    date: string | null,
    fromDate: string | null,
    toDate: string | null
  ) => void;

  onClear: () => void;
  onClose: () => void;
};

export default function DateFilter({
  currentDate,
  currentFromDate,
  currentToDate,
  onApply,
  onClear,
  onClose,
}: DateFilterProps) {
  const today = new Date().toISOString().slice(0, 10);

  const [useRange, setUseRange] = useState(
    !!currentFromDate && !!currentToDate
  );

  const [date, setDate] = useState(
    currentDate || today
  );

  const [fromDate, setFromDate] = useState(
    currentFromDate || today
  );

  const [toDate, setToDate] = useState(
    currentToDate || today
  );

  const handleApply = () => {
    if (useRange) {
      if (fromDate > toDate) {
        alert("From date cannot be after To date");
        return;
      }

      onApply(null, fromDate, toDate);
      return;
    }

    onApply(date, null, null);
  };

  return (
<div className="fixed bottom-0 left-1/2 z-[60] w-[calc(100%-24px)] max-w-md -translate-x-1/2 rounded-t-[24px] bg-white p-4 shadow-2xl dark:bg-[#18181b]">      <div className="w-full rounded-t-3xl bg-[var(--surface)] p-5">

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            Date
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-[var(--muted)]"
          >
            ×
          </button>
        </div>

        {!useRange && (
          <div className="mb-4">
            <label className="mb-2 block text-sm text-[var(--muted)]">
              Select date
            </label>

            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] p-3 outline-none"
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => setUseRange((value) => !value)}
          className="mb-4 w-full rounded-xl border border-[var(--border)] p-3 text-sm font-semibold"
        >
          {useRange ? "Use Single Date" : "Custom Date Range"}
        </button>

        {useRange && (
          <div className="mb-4 grid grid-cols-2 gap-3">

            <div>
              <label className="mb-2 block text-sm text-[var(--muted)]">
                From
              </label>

              <input
                type="date"
                value={fromDate}
                max={today}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] p-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--muted)]">
                To
              </label>

              <input
                type="date"
                value={toDate}
                max={today}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] p-3 outline-none"
              />
            </div>

          </div>
        )}

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
            onClick={handleApply}
            className="flex-1 rounded-xl bg-blue-600 p-3 font-semibold text-white"
          >
            Apply
          </button>

        </div>

      </div>
    </div>
  );
}