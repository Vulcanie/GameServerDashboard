import express from "express";
import http from "http";
import { Server } from "socket.io";
import apiRoutes from "./routes/api.js";
import { pollServers } from "./services/pollingService.js";

// Basic server setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: { origin: "https://vulcanie.github.io" }, // Allow GitHub Pages frontend
});
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// API routes
app.use("/api", apiRoutes);

// WebSocket connection handling
io.on("connection", (socket) => {
	console.log("🔌 Client connected");
	socket.on("disconnect", () => console.log("❌ Client disconnected"));
});

// Start the server
server.listen(PORT, "0.0.0.0", () => {
	console.log(`✅ Dashboard API running on http://50.82.40.123:${PORT}`);

	// Initial poll, then start the interval.
	pollServers(io);
	setInterval(() => pollServers(io), 5000);
});
// howdy
