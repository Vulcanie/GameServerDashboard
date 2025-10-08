import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import open from "open";
import apiRoutes from "./routes/api.js";
import { pollServers } from "./services/pollingService.js";

// Basic server setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: { origin: "*" },
});
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "client", "build")));

// API routes
app.use("/api", apiRoutes);

// WebSocket connection handling
io.on("connection", (socket) => {
	console.log("🔌 Client connected");
	socket.on("disconnect", () => console.log("❌ Client disconnected"));
});

// Start the server
server.listen(PORT, "0.0.0.0", () => {
	const url = `http://localhost:${PORT}`;
	console.log(`✅ Dashboard running on ${url}`);

	// Initial poll, then start the interval.
	pollServers(io);
	setInterval(() => pollServers(io), 5000);

	// Open the dashboard in the default browser
	open(url);
});
