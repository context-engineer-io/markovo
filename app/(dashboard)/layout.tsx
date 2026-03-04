"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { useSocket } from "@/hooks/use-socket";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SocketProvider } from "@/components/dashboard/socket-provider";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/content": "Content",
  "/campaigns": "Campaigns",
  "/analytics": "Analytics",
  "/chat": "Chat",
  "/settings": "Settings",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { status, lastEvent } = useSocket();

  const title =
    pageTitles[pathname] ??
    pathname.split("/").pop()?.replace(/-/g, " ") ??
    "Dashboard";

  const handleMenuToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleSheetChange = useCallback((open: boolean) => {
    setSidebarOpen(open);
  }, []);

  return (
    <SocketProvider status={status} lastEvent={lastEvent}>
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-border lg:bg-background">
          <div className="flex h-14 items-center border-b border-border px-4">
            <span className="text-lg font-bold tracking-tight">Intent</span>
          </div>
          <Sidebar />
        </aside>

        {/* Mobile sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={handleSheetChange}>
          <SheetContent side="left" className="w-60 p-0">
            <div className="flex h-14 items-center border-b border-border px-4">
              <span className="text-lg font-bold tracking-tight">Intent</span>
            </div>
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          <Header
            title={title}
            connectionStatus={status}
            onMenuToggle={handleMenuToggle}
          />
          <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </SocketProvider>
  );
}
