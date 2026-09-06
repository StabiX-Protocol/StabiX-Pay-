"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";

const PUBLIC_ROUTES = [
  "/login",
  "/create-account",
  "/forgot-password",
];

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  //bottom navigation hide unhide logic
  const hideBottomNav = pathname.startsWith("/send")|| 
  pathname.startsWith("/receive") || 
  pathname.startsWith("/profile") ||
  pathname.startsWith("/primary") ||
  pathname.startsWith("/history") ||
  pathname.startsWith("/settings") ||
  pathname.startsWith("/create-account") ||
  pathname.startsWith("/forgot-password") ||
  pathname.startsWith("/login");


  
  useEffect(() => {
    const token = localStorage.getItem("jwt_token");

    if (isPublicRoute) {
      if (token && pathname === "/login") {
        router.replace("/");
        return;
      }

      setCheckingAuth(false);
      return;
    }

    if (!token) {
      router.replace("/login");
      return;
    }

    setAuthenticated(true);
    setCheckingAuth(false);
  }, [pathname, router, isPublicRoute]);

  if (checkingAuth) {
    return null;
  }

  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-slate-100">
        <main className="mx-auto min-h-screen w-full max-w-[430px] bg-[#f5f7fb] shadow-xl">
          {children}
        </main>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto min-h-screen w-full max-w-[430px] bg-[#f5f7fb] shadow-xl">
        {children}
        {!hideBottomNav && <BottomNav />}
      </main>
    </div>
  );
}
