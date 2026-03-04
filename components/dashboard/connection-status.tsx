"use client";

import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  status: "connected" | "disconnected" | "connecting";
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2" role="status" aria-live="polite">
      <span
        className={cn(
          "size-2 rounded-full",
          status === "connected" && "bg-emerald-500",
          status === "connecting" && "bg-amber-500 animate-pulse",
          status === "disconnected" && "bg-muted-foreground/40"
        )}
        aria-hidden="true"
      />
      <span className="text-xs text-muted-foreground capitalize sr-only sm:not-sr-only">
        {status}
      </span>
    </div>
  );
}
