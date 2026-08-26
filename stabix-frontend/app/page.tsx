import AppHeader from "@/components/AppHeader";
import BalanceCard from "@/components/BalanceCard";
import QuickActions from "@/components/QuickActions";
import Assets from "@/components/Assets";
import ValidatorPanel from "@/components/ValidatorPanel";


export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f7f9] text-slate-900 dark:bg-[#0b0b0d] dark:text-white">
      <div className="mx-auto min-h-screen w-full max-w-md pb-28">
        <AppHeader />

        <BalanceCard />

        <QuickActions />
        <Assets />

        <ValidatorPanel />
      </div>

    </main>
  );
}