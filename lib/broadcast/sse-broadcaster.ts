import type { DashboardUpdatedEvent } from "@/types/dashboard";
import type { Broadcaster } from "./types";

const MAX_EVENTS = 100;
const events: DashboardUpdatedEvent[] = [];

export class SSEBroadcaster implements Broadcaster {
  async broadcast(event: DashboardUpdatedEvent): Promise<void> {
    events.push(event);
    if (events.length > MAX_EVENTS) {
      events.shift();
    }
  }

  static getEvents(): DashboardUpdatedEvent[] {
    return events;
  }

  static clearEvents(): void {
    events.length = 0;
  }
}
