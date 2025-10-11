import express from "express";
import fs from "fs";
import path from "path";
import { SERVERS_TO_QUERY } from "../config/servers.js"; // adjust path if needed

const router = express.Router();

// ✅ Get batch file content by server name
router.get("/by-server/:serverName", (req, res) => {
	try {
		const serverName = req.params.serverName.trim();
		const server = SERVERS_TO_QUERY.find((s) => s.name === serverName);

		if (!server || !server.startScriptPath) {
			console.warn(
				`Batch file GET failed: server not found - ${serverName}`,
			);
			return res.status(404).send("Server or script not found");
		}

		const filePath = server.startScriptPath;
		if (!fs.existsSync(filePath)) {
			console.warn(`Batch file GET failed: file not found - ${filePath}`);
			return res.status(404).send("Batch file not found");
		}

		const content = fs.readFileSync(filePath, "utf8");
		res.send(content);
	} catch (err) {
		console.error("Error reading batch file:", err);
		res.status(500).send("Internal server error");
	}
});

// ✅ Save batch file content by server name
router.post("/by-server/:serverName", (req, res) => {
	try {
		const serverName = req.params.serverName.trim();
		const server = SERVERS_TO_QUERY.find((s) => s.name === serverName);

		if (!server || !server.startScriptPath) {
			console.warn(
				`Batch file SAVE failed: server not found - ${serverName}`,
			);
			return res.status(404).send("Server or script not found");
		}

		const content = req.body.content;
		if (typeof content !== "string") {
			return res.status(400).send("Invalid content format");
		}

		fs.writeFileSync(server.startScriptPath, content, "utf8");
		console.log(`✅ Batch file saved for ${serverName}`);
		res.send("Saved");
	} catch (err) {
		console.error("Error saving batch file:", err);
		res.status(500).send("Internal server error");
	}
});

export default router;
