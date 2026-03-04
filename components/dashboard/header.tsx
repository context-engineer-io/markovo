"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectionStatus } from "./connection-status";

interface HeaderProps {
  title: string;
  connectionStatus: "connected" | "disconnected" | "connecting";
  onMenuToggle: () => void;
}

export function Header({ title, connectionStatus, onMenuToggle }: HeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuToggle}
        aria-label="Toggle navigation menu"
      >
        <Menu className="size-5" />
      </Button>
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="ml-auto flex items-center gap-4">
        <ConnectionStatus status={connectionStatus} />
      </div>
    </header>
  );
}
