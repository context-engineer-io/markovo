import type { DashboardUpdatedEvent } from "@/types/dashboard";
import { broadcaster } from "@/lib/broadcast";

export async function broadcastEvent(event: DashboardUpdatedEvent) {
  await broadcaster.broadcast(event);
}
