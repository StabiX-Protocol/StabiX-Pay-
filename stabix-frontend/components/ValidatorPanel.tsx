export default function ValidatorPanel() {
  return (
    <section className="px-5 pt-8">
      <div className="border-t border-slate-200 pt-7 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Validator Panel
            </h2>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm dark:bg-[#18181b]">
            ◇
          </div>
        </div>

        <div className="mt-5 rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-slate-100 dark:bg-[#18181b] dark:ring-white/10">
          <label
            htmlFor="validator-uid"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            Target STBX UID
          </label>

          <input
            id="validator-uid"
            type="text"
            placeholder="STBXX..."
            className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 dark:border-white/10 dark:bg-[#111113] dark:focus:border-white"
          />

          <button
            type="button"
            className="mt-3 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition active:scale-[0.98] dark:bg-white dark:text-black"
          >
            Continue
          </button>
        </div>
      </div>
    </section>
  );
}