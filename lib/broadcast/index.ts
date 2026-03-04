import type { Broadcaster, BroadcastMode } from "./types";
import { SSEBroadcaster } from "./sse-broadcaster";
import { SocketIOBroadcaster } from "./socketio-broadcaster";

const BROADCAST_MODE = (process.env.BROADCAST_MODE || "sse") as BroadcastMode;

function createBroadcaster(): Broadcaster {
  switch (BROADCAST_MODE) {
    case "socketio":
      return new SocketIOBroadcaster();
    case "sse":
    default:
      return new SSEBroadcaster();
  }
}

const broadcaster = createBroadcaster();

export { broadcaster, SSEBroadcaster };
