import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import { Server as IOServer } from "socket.io";
import path from "path";
import apiRouter from "../routes/api.js";
import { pollServers } from "../services/pollingService.js";

const app = express();

// ✅ Log every incoming request
app.use((req, res, next) => {
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
	if (req.headers["ngrok-skip-browser-warning"]) {
		res.setHeader("ngrok-skip-browser-warning", "true");
	}
	next();
});

app.use(
	cors({
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
	}),
);

const server = http.createServer(app);
const io = new IOServer(server, {
	cors: {
		origin: process.env.CORS_ORIGIN || "https://vulcanie.github.io",
		methods: ["GET", "POST"],
	},
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Mount API routes first
app.use("/api", apiRouter);

// ✅ API key middleware for write protection
function requireApiKeyForWrites(req, res, next) {
	if (req.method === "GET") return next();

	const apiKey = process.env.API_KEY;
	if (!apiKey) return next();

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

app.use("/api/config", requireApiKeyForWrites);
app.use("/api/control", requireApiKeyForWrites);

// ✅ Serve static frontend only if enabled
if (process.env.SERVE_STATIC === "1") {
	const buildPath = path.resolve("../client/build");
	app.use(express.static(buildPath));

	// ✅ Guard fallback route to avoid hijacking /api/*
	app.get("*", (req, res, next) => {
		if (req.path.startsWith("/api")) return next();
		res.sendFile(path.join(buildPath, "index.html"));
	});
}

// ✅ Catch-all for unhandled API routes
app.use("/api/*", (req, res) => {
	console.warn("Unhandled API route:", req.method, req.originalUrl);
	res.status(404).json({ error: "API route not found" });
});

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
server.listen(PORT, "0.0.0.0", () => {
	console.log(`API server listening on http://0.0.0.0:${PORT}`);
	startPolling();
});

export default server;
