import type { DashboardUpdatedEvent } from "@/types/dashboard";
import type { Broadcaster } from "./types";

const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:3001";

export class SocketIOBroadcaster implements Broadcaster {
  async broadcast(event: DashboardUpdatedEvent): Promise<void> {
    await fetch(`${SOCKET_URL}/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
  }
}
