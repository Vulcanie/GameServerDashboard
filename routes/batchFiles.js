import express from "express";
import fs from "fs";
import path from "path";
import { SERVERS_TO_QUERY } from "../config/servers.js"; // adjust path as needed

const router = express.Router();

// Get batch file content by server name
router.get("/by-server/:serverName", (req, res) => {
	const server = SERVERS_TO_QUERY.find(
		(s) => s.name === req.params.serverName,
	);
	if (!server || !server.startScriptPath) {
		return res.status(404).send("Server or script not found");
	}
	const filePath = server.startScriptPath;
	if (!fs.existsSync(filePath))
		return res.status(404).send("Batch file not found");
	const content = fs.readFileSync(filePath, "utf8");
	res.send(content);
});

// Save batch file content by server name
router.post("/by-server/:serverName", (req, res) => {
	const server = SERVERS_TO_QUERY.find(
		(s) => s.name === req.params.serverName,
	);
	if (!server || !server.startScriptPath) {
		return res.status(404).send("Server or script not found");
	}
	fs.writeFileSync(server.startScriptPath, req.body.content, "utf8");
	res.send("Saved");
});
