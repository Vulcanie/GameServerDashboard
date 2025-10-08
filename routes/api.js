import express from "express";
import { promises as fs } from "fs";
import { exec } from "child_process";
import { Rcon } from "rcon-client";
import { SERVERS_TO_QUERY } from "../config/servers.js";
import { serverStatus } from "../services/pollingService.js";

const router = express.Router();

// This route provides the live status of all servers.
router.get("/status", (req, res) => {
	res.json(serverStatus);
});

// This route provides basic info about a single server for the config page.
router.get("/server/:serverName", (req, res) => {
	const server = SERVERS_TO_QUERY.find(
		(s) => s.name === req.params.serverName,
	);
	if (!server) {
		return res.status(404).json({ error: "Server not found" });
	}
	res.json({
		name: server.name,
		type: server.type,
		configNames: server.configPaths
			? Object.keys(server.configPaths)
			: server.configPath
			? ["config"]
			: [],
	});
});

// This route gets the content of a specific config file.
router.get("/config/:serverName", async (req, res) => {
	const server = SERVERS_TO_QUERY.find(
		(s) => s.name === req.params.serverName,
	);
	const { file } = req.query;
	if (!server) {
		return res.status(404).json({ error: "Server not found" });
	}
	let pathToRead = server.configPaths
		? server.configPaths[file]
		: server.configPath;
	if (!pathToRead) {
		return res
			.status(400)
			.json({ error: "Valid config file must be specified." });
	}
	try {
		const configContent = await fs.readFile(pathToRead, "utf-8");
		res.json({ content: configContent });
	} catch (error) {
		console.error(
			`Error reading config for ${req.params.serverName}:`,
			error,
		);
		res.status(500).json({ error: "Failed to read config file." });
	}
});

// This route saves a config file.
router.post("/config/:serverName", async (req, res) => {
	const server = SERVERS_TO_QUERY.find(
		(s) => s.name === req.params.serverName,
	);
	const { fileName, content } = req.body;
	if (!server) {
		return res.status(404).json({ error: "Server not found" });
	}
	let pathToWrite = server.configPaths
		? server.configPaths[fileName]
		: server.configPath;
	if (!pathToWrite) {
		return res
			.status(400)
			.json({ error: "A valid fileName must be provided." });
	}
	try {
		await fs.copyFile(pathToWrite, `${pathToWrite}.bak`);
		await fs.writeFile(pathToWrite, content, "utf-8");
		res.json({ success: true, message: `${fileName} saved successfully!` });
	} catch (error) {
		console.error(`Error writing config for ${server.name}:`, error);
		res.status(500).json({
			error: `Failed to save ${fileName}. System error: ${error.code}`,
		});
	}
});

// This route starts and stops servers.
router.post("/control/:serverName/:action", async (req, res) => {
	const { serverName, action } = req.params;
	const server = SERVERS_TO_QUERY.find((s) => s.name === serverName);
	if (!server) {
		return res.status(404).json({ error: "Server not found" });
	}

	if (action === "start") {
		if (!server.startScriptPath) {
			return res
				.status(400)
				.json({ error: "Start script path is not configured." });
		}
		const command = `"${server.startScriptPath}"`;
		const options = { cwd: server.workingDir };
		exec(command, options, (error, stdout, stderr) => {
			if (error) {
				console.error(`Exec error for ${serverName}:`, error);
				return res
					.status(500)
					.json({
						error: `Failed to execute start script: ${error.message}`,
					});
			}
			res.json({
				success: true,
				message: `${serverName} is starting...`,
			});
		});
	} else if (action === "stop") {
		if (server.rconPort && server.rconPassword) {
			let rcon;
			try {
				rcon = new Rcon({
					host: server.host,
					port: server.rconPort,
					password: server.rconPassword,
				});
				await rcon.connect();
				const command = server.type === "minecraft" ? "stop" : "DoExit";
				await rcon.send(command);
				res.json({
					success: true,
					message: `${serverName} stop command sent via RCON.`,
				});
			} catch (e) {
				console.error(`RCON stop error for ${serverName}:`, e);
				res.status(500).json({
					error: "RCON command failed. Is the server online?",
				});
			} finally {
				if (rcon) await rcon.end();
			}
		} else if (server.processName) {
			const command = `taskkill /IM "${server.processName}" /F`;
			exec(command, (error, stdout, stderr) => {
				if (error && !stderr.includes("not found")) {
					console.error(`Taskkill error for ${serverName}:`, error);
					return res
						.status(500)
						.json({
							error: `Failed to stop server: ${error.message}`,
						});
				}
				res.json({
					success: true,
					message: `${serverName} stop command sent via Taskkill.`,
				});
			});
		} else {
			res.status(400).json({
				error: `No stop method is configured for ${serverName}.`,
			});
		}
	} else {
		res.status(400).json({ error: "Invalid action." });
	}
});

export default router;
