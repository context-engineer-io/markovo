"use client";

import { useEffect, useState } from "react";
import type { DashboardUpdatedEvent } from "@/types/dashboard";

type ConnectionStatus = "connected" | "disconnected" | "connecting";

const BROADCAST_MODE = (process.env.NEXT_PUBLIC_BROADCAST_MODE || "sse") as
  | "sse"
  | "socketio";

export function useRealtime() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [lastEvent, setLastEvent] = useState<DashboardUpdatedEvent | null>(
    null
  );

  useEffect(() => {
    if (BROADCAST_MODE === "sse") {
      setStatus("connecting");

      const eventSource = new EventSource("/api/events/stream");

      eventSource.onopen = () => {
        setStatus("connected");
      };

      eventSource.onerror = () => {
        setStatus("disconnected");
      };

      eventSource.onmessage = (event) => {
        if (event.data && !event.data.startsWith(":")) {
          try {
            const dashboardEvent = JSON.parse(
              event.data
            ) as DashboardUpdatedEvent;
            setLastEvent(dashboardEvent);
          } catch (error) {
            console.error("Failed to parse SSE event:", error);
          }
        }
      };

      return () => {
        eventSource.close();
      };
    } else {
      setStatus("connecting");

      const SOCKET_URL =
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

      let cleanup: (() => void) | null = null;

      import("socket.io-client").then(({ io }) => {
        const socket = io(SOCKET_URL, {
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        });

        socket.on("connect", () => {
          setStatus("connected");
        });

        socket.on("disconnect", () => {
          setStatus("disconnected");
        });

        socket.on("connect_error", () => {
          setStatus("disconnected");
        });

        socket.on("DashboardUpdated", (event: DashboardUpdatedEvent) => {
          setLastEvent(event);
        });

        cleanup = () => {
          socket.disconnect();
        };
      });

      return () => {
        cleanup?.();
      };
    }
  }, []);

  return { status, lastEvent };
}
