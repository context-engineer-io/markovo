"use client";

import { createContext, useContext } from "react";
import type { DashboardUpdatedEvent } from "@/types/dashboard";

interface SocketContextValue {
  status: "connected" | "disconnected" | "connecting";
  lastEvent: DashboardUpdatedEvent | null;
}

const SocketContext = createContext<SocketContextValue>({
  status: "disconnected",
  lastEvent: null,
});

export function SocketProvider({
  children,
  status,
  lastEvent,
}: SocketContextValue & { children: React.ReactNode }) {
  return (
    <SocketContext.Provider value={{ status, lastEvent }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  return useContext(SocketContext);
}
