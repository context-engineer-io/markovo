import type { DashboardUpdatedEvent } from "@/types/dashboard";

const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:3001";

export async function broadcastEvent(event: DashboardUpdatedEvent) {
  await fetch(`${SOCKET_URL}/broadcast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
}
