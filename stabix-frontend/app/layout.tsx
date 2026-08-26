import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
export const metadata: Metadata = {
  title: "StabiX",
  description: "Fast and simple stablecoin payments",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
     <body className="min-h-full flex flex-col">
  <AppShell>{children}</AppShell>
</body>
    </html>
  );
}