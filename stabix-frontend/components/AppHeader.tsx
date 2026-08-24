export default function AppHeader() {
  return (
    <header className="flex items-center justify-between px-5 pb-4 pt-6">
      <div>
        <p className="text-sm font-medium text-gray-500">
          Welcome back
        </p>

        <h1 className="text-2xl font-bold tracking-tight">
          StabiX
        </h1>
      </div>

      <button
        type="button"
        aria-label="Open profile"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
      >
        <span className="text-lg">◉</span>
      </button>
    </header>
  );
}