"use client";

type AppPopupProps = {
  open: boolean;
  message: string;
  onClose: () => void;
};

export default function AppPopup({
  open,
  message,
  onClose,
}: AppPopupProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-6">
      <div className="w-full max-w-[340px] rounded-[22px] bg-white p-5 shadow-2xl dark:bg-[#1b1b1f]">
        <p className="text-[15px] leading-6 text-slate-700 dark:text-slate-200">
          {message}
        </p>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition active:scale-95"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}