"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { ChatPanel } from "@/components/dashboard/chat-panel";
import { useSocket } from "@/hooks/use-socket";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SocketProvider } from "@/components/dashboard/socket-provider";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/content": "Content",
  "/campaigns": "Campaigns",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);
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

  const handleChatToggle = useCallback(() => {
    setChatOpen((prev) => !prev);
  }, []);

  const handleFocusModeToggle = useCallback(() => {
    setFocusModeEnabled((prev) => !prev);
  }, []);

  const handleChatSheetChange = useCallback((open: boolean) => {
    setChatOpen(open);
  }, []);

  return (
    <SocketProvider status={status} lastEvent={lastEvent}>
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-border lg:bg-background">
          <div className="flex h-14 items-center border-b border-border px-4">
            <span className="text-lg font-bold tracking-tight">Intent</span>
          </div>
          <Sidebar
            focusModeEnabled={focusModeEnabled}
            onFocusModeToggle={handleFocusModeToggle}
          />
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
        <div className="flex flex-1 flex-col min-w-0">
          <Header
            title={title}
            connectionStatus={status}
            onMenuToggle={handleMenuToggle}
          />
          <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
        </div>

        {/* Desktop chat panel - hidden in focus mode */}
        <aside
          className={cn(
            "hidden lg:flex lg:flex-col lg:border-l lg:border-border transition-all duration-300",
            focusModeEnabled ? "lg:w-0 lg:opacity-0 overflow-hidden" : "lg:w-[400px] xl:w-[450px]"
          )}
        >
          <ChatPanel connectionStatus={status} />
        </aside>

        {/* Mobile chat button */}
        <Button
          size="icon"
          onClick={handleChatToggle}
          className="fixed bottom-6 right-6 size-14 rounded-full shadow-lg lg:hidden"
          aria-label="Open chat"
        >
          <MessageSquare className="size-6" />
        </Button>

        {/* Mobile chat panel */}
        <Sheet open={chatOpen} onOpenChange={handleChatSheetChange}>
          <SheetContent side="right" className="w-full p-0 sm:max-w-md">
            <ChatPanel
              connectionStatus={status}
              onClose={handleChatToggle}
              isMobile
            />
          </SheetContent>
        </Sheet>
      </div>
    </SocketProvider>
  );
}
