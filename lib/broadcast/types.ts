import type { DashboardUpdatedEvent } from "@/types/dashboard";

export interface Broadcaster {
  broadcast(event: DashboardUpdatedEvent): Promise<void>;
}

export type BroadcastMode = "sse" | "socketio";
