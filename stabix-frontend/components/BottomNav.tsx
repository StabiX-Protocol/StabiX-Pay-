const navigationItems = [
  "Home",
  "History",
  "Wallet",
  "Profile",
];

export default function BottomNav() {
  return (
    <nav className="sticky bottom-0 border-t border-gray-200 bg-white px-5 py-4">
      <div className="grid grid-cols-4 text-center text-xs font-medium text-gray-500">
        {navigationItems.map((item) => (
          <button
            key={item}
            type="button"
            className="transition-colors active:text-gray-900"
          >
            {item}
          </button>
        ))}
      </div>
    </nav>
  );
}