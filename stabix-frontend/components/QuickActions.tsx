const actions = [
  {
    label: "Send",
    icon: "↑",
  },
  {
    label: "Receive",
    icon: "↓",
  },
  {
    label: "QR",
    icon: "⌗",
  },
];

export default function QuickActions() {
  return (
    <section className="grid grid-cols-3 gap-3 px-5 pt-5">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          className="flex flex-col items-center justify-center rounded-[24px] bg-white py-4 shadow-sm ring-1 ring-slate-100 transition-all active:scale-95 dark:bg-[#18181b] dark:ring-white/10"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-2xl font-light text-white shadow-md dark:bg-white dark:text-black">
            {action.icon}
          </span>

          <span className="mt-2.5 text-sm font-semibold text-slate-800 dark:text-white">
            {action.label}
          </span>
        </button>
      ))}
    </section>
  );
}