import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import { Server as IOServer } from "socket.io";
import path from "path";
import apiRouter from "../routes/api.js";
import { pollServers } from "../services/pollingService.js";

const app = express();
const server = http.createServer(app);
const io = new IOServer(server, {
	cors: {
		origin: process.env.CORS_ORIGIN || true,
		methods: ["GET", "POST"],
	},
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API under /api
app.use("/api", apiRouter);

// Simple API key middleware: if API_KEY is set in env, require it for write
// operations (non-GET) under sensitive routes.
function requireApiKeyForWrites(req, res, next) {
	// Allow safe reads
	if (req.method === "GET") return next();

	const apiKey = process.env.API_KEY;
	// If no API_KEY is configured, don't enforce (useful for local/dev).
	if (!apiKey) return next();

	// Accept the key via header 'x-api-key', query param 'api_key', or
	// Authorization: Bearer <key>
	const provided = (
		req.headers["x-api-key"] ||
		req.query.api_key ||
		(req.get("authorization") || "").split(" ")[1] ||
		""
	).toString();
	if (provided === apiKey) return next();

	return res
		.status(401)
		.json({ error: "Unauthorized: invalid or missing API key" });
}

// Protect config and control endpoints for write operations
app.use("/api/config", requireApiKeyForWrites);
app.use("/api/control", requireApiKeyForWrites);

// Optionally serve the built client (if you want the server to host the frontend)
if (process.env.SERVE_STATIC === "1") {
	const buildPath = path.resolve("../client/build");
	app.use(express.static(buildPath));
	app.get("*", (req, res) =>
		res.sendFile(path.join(buildPath, "index.html")),
	);
}

io.on("connection", (socket) => {
	console.log("socket connected:", socket.id);
	socket.on("disconnect", () =>
		console.log("socket disconnected:", socket.id),
	);
});

const POLL_INTERVAL_MS = process.env.POLL_INTERVAL_MS
	? Number(process.env.POLL_INTERVAL_MS)
	: 5000;

async function startPolling() {
	try {
		await pollServers(io);
	} catch (err) {
		console.error("Initial polling failed:", err);
	}
	setInterval(
		() =>
			pollServers(io).catch((err) =>
				console.error("Polling failed:", err),
			),
		POLL_INTERVAL_MS,
	);
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
	console.log(`API server listening on http://localhost:${PORT}`);
	startPolling();
});

export default server;
