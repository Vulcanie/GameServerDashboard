// cache-server.js
const express = require("express");
const fetch = require("node-fetch");

const PORT = 4000; // port for the cache service
const API_TARGET = "http://localhost:3001/api/status"; // your real API

const app = express();
let latestStatus = null;
let lastUpdated = null;

// Poll the API every 5 seconds
async function pollApi() {
	try {
		const res = await fetch(API_TARGET);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		latestStatus = await res.json();
		lastUpdated = new Date();
		console.log("✅ Cache updated:", lastUpdated.toISOString());
	} catch (err) {
		console.error("❌ Polling failed:", err.message);
	}
}
setInterval(pollApi, 15000); // every 15 seconds
pollApi(); // run immediately on startup

// Endpoint for clients to read cached data
app.get("/api/status/latest", (req, res) => {
	if (!latestStatus) {
		return res.status(503).json({ error: "Cache not ready yet" });
	}
	res.json({
		cachedAt: lastUpdated,
		data: latestStatus,
	});
});

app.listen(PORT, () =>
	console.log(`Cache service running at http://localhost:${PORT}`),
);
