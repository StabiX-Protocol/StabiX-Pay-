"use client";

type HistorySearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function HistorySearch({
  value,
  onChange,
}: HistorySearchProps) {
  return (
    <div className="relative mt-3">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search transactions..."
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 pr-11 text-sm outline-none placeholder:text-[var(--muted)] focus:border-blue-600"
      />

      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
        ⌕
      </span>
    </div>
  );
}