import { createServer } from "node:http";
import { Server } from "socket.io";
import type { DashboardUpdatedEvent } from "../types/dashboard";

const PORT = Number(process.env.SOCKET_PORT) || 3001;

const httpServer = createServer((req, res) => {
  // Internal broadcast endpoint — called by API routes to push events to clients
  if (req.method === "POST" && req.url === "/broadcast") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const event = JSON.parse(body) as DashboardUpdatedEvent;
        io.emit("DashboardUpdated", event);
        console.log(`[socket] Broadcast: ${event.type}`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  // Health check
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", connections: io.engine.clientsCount }));
    return;
  }

  res.writeHead(404);
  res.end();
});

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`[socket] Client connected: ${socket.id}`);

  socket.on("disconnect", (reason) => {
    console.log(`[socket] Client disconnected: ${socket.id} (${reason})`);
  });
});

export function startSocketServer() {
  httpServer.listen(PORT, () => {
    console.log(`[socket] Socket.IO server running on http://localhost:${PORT}`);
  });
}
