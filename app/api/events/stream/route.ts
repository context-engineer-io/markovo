import { SSEBroadcaster } from "@/lib/broadcast";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let lastEventIndex = 0;

      const interval = setInterval(() => {
        try {
          const events = SSEBroadcaster.getEvents();

          if (events.length > lastEventIndex) {
            for (let i = lastEventIndex; i < events.length; i++) {
              const event = events[i];
              const data = `data: ${JSON.stringify(event)}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
            lastEventIndex = events.length;
          } else {
            controller.enqueue(encoder.encode(": heartbeat\n\n"));
          }
        } catch (error) {
          console.error("SSE stream error:", error);
        }
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
