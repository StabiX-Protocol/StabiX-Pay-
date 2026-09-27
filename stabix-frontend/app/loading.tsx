export default function Loading() {
  return (
    <main className="min-h-screen w-full bg-[#f6f7f9] dark:bg-[#0b0b0d]">
      <div className="mx-auto min-h-screen w-full max-w-md px-5 py-6">
        <div className="h-8 w-32 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />

        <div className="mt-8 h-36 w-full animate-pulse rounded-[28px] bg-white shadow-sm dark:bg-[#18181b]" />

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="h-28 animate-pulse rounded-[24px] bg-white shadow-sm dark:bg-[#18181b]" />
          <div className="h-28 animate-pulse rounded-[24px] bg-white shadow-sm dark:bg-[#18181b]" />
        </div>

        <div className="mt-6 h-20 w-full animate-pulse rounded-[24px] bg-white shadow-sm dark:bg-[#18181b]" />

        <div className="mt-4 h-20 w-full animate-pulse rounded-[24px] bg-white shadow-sm dark:bg-[#18181b]" />
      </div>
    </main>
  );
}