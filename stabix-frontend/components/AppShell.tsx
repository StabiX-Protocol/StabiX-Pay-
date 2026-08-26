"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideBottomNav =
    pathname.startsWith("/dw/") ||
    pathname.startsWith("/send/") ||
    pathname.startsWith("/receive/");

  return (
    <>
      {children}

      {!hideBottomNav && <BottomNav />}
    </>
  );
}