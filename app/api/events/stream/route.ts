import { SSEBroadcaster } from "@/lib/broadcast";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        const events = SSEBroadcaster.getEvents();

        if (events.length > 0) {
          for (const event of events) {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
          SSEBroadcaster.clearEvents();
        } else {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
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
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
