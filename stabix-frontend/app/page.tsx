import AppHeader from "@/components/AppHeader";
import BalanceCard from "@/components/BalanceCard";
import BottomNav from "@/components/BottomNav";
import QuickActions from "@/components/QuickActions";
import RecentTransactions from "@/components/RecentTransactions";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">

        <AppHeader />

        <BalanceCard />

        <QuickActions />

        <RecentTransactions />

        <BottomNav />

      </div>
    </main>
  );
}