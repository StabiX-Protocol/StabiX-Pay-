const actions = ["Send", "Receive", "Deposit", "Withdraw"];

export default function QuickActions() {
  return (
    <section className="grid grid-cols-4 gap-3 px-5 pt-6">
      {actions.map((action) => (
        <button
          key={action}
          type="button"
          className="flex flex-col items-center gap-2 rounded-2xl bg-white px-2 py-4 text-sm font-medium shadow-sm transition-transform active:scale-95"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">
            +
          </span>

          {action}
        </button>
      ))}
    </section>
  );
}