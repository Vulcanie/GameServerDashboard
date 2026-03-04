import { GameDig } from "gamedig";
import { Rcon } from "rcon-client";
import { SERVERS_TO_QUERY } from "../config/servers.js";
import { broadcastSseEvent } from "../routes/api.js"; // adjust path if needed
import { sendDiscordAlert } from "./discordService.js";

// Holds the latest known status
export let serverStatus = {};
SERVERS_TO_QUERY.forEach((s) => {
	serverStatus[s.name] = { online: false, playerList: [], playerCount: 0 };
});

// Snapshot for diffing
let lastSnapshot = {};

async function diffAndBroadcast(current, previous) {
	for (const [serverName, cur] of Object.entries(current)) {
		const prev = previous[serverName] || {};

		// -----------------------------
		// ONLINE / OFFLINE STATE CHANGE
		// -----------------------------
		if (prev.online !== undefined && cur.online !== prev.online) {
			if (cur.online) {
				// Server came online
				await sendDiscordAlert(
					`🟢 ${serverName} is now ONLINE\n` +
						`Session: ${cur.sessionName || "Unknown"}\n` +
						`Players: ${cur.playerCount}`,
				);
			} else {
				// Server went offline
				await sendDiscordAlert(`🔴 ${serverName} went OFFLINE`);
			}
		}

		// -----------------------------
		// EXISTING CHANGE DETECTION (SSE)
		// -----------------------------
		const changed =
			cur.online !== prev.online ||
			cur.playerCount !== prev.playerCount ||
			JSON.stringify(cur.playerList) !==
				JSON.stringify(prev.playerList) ||
			cur.sessionName !== prev.sessionName ||
			cur.ping !== prev.ping;

		if (changed) {
			broadcastSseEvent({
				type: "server_update",
				serverName,
				status: cur,
			});
		}
	}

	// -----------------------------
	// NEW SERVER DETECTED
	// -----------------------------
	for (const serverName of Object.keys(current)) {
		if (!previous[serverName]) {
			broadcastSseEvent({
				type: "server_added",
				serverName,
				status: current[serverName],
			});
		}
	}

	// -----------------------------
	// REMOVED SERVER DETECTED
	// -----------------------------
	for (const serverName of Object.keys(previous)) {
		if (!current[serverName]) {
			broadcastSseEvent({
				type: "server_removed",
				serverName,
			});
		}
	}
}
// Main polling function
export const pollServers = async () => {
	try {
		const promises = SERVERS_TO_QUERY.map(async (serverConfig) => {
			const baseInfo = {
				sessionName: serverConfig.sessionName,
				serverPassword: serverConfig.serverPassword,
				joinAddress: serverConfig.joinAddress,
				type: serverConfig.type,
			};

			// -----------------------------
			// RCON POLLING
			// -----------------------------
			if (serverConfig.method === "rcon") {
				let rcon;

				try {
					rcon = new Rcon({
						host: serverConfig.host,
						port: serverConfig.rconPort,
						password: serverConfig.rconPassword,
					});

					// Prevent process crash on socket errors
					rcon.on("error", (err) => {
						console.warn(
							`RCON error on ${serverConfig.name}:`,
							err.message,
						);
					});

					await rcon.connect();

					const startTime = Date.now();
					const playerListStr = await rcon.send("ListPlayers");
					const ping = Date.now() - startTime;

					const players = playerListStr
						.split("\n")
						.map((line) => line.trim())
						.filter((line) => /^\d+\./.test(line))
						.map((line) =>
							line.substring(
								line.indexOf(".") + 2,
								line.indexOf(","),
							),
						);

					serverStatus[serverConfig.name] = {
						...baseInfo,
						online: true,
						playerCount: players.length,
						playerList: players,
						ping,
					};
				} catch (error) {
					serverStatus[serverConfig.name] = {
						...baseInfo,
						online: false,
						playerCount: 0,
						playerList: [],
					};
				} finally {
					if (rcon) {
						try {
							await rcon.end();
						} catch {}
					}
				}
			}

			// -----------------------------
			// GAMEDIG POLLING
			// -----------------------------
			else if (serverConfig.method === "gamedig") {
				try {
					const state = await GameDig.query({
						type: serverConfig.type,
						host: serverConfig.host,
						port: serverConfig.port,
					});

					serverStatus[serverConfig.name] = {
						...baseInfo,
						online: true,
						sessionName: baseInfo.sessionName || state.name,
						playerCount: state.players.length,
						maxplayers: state.maxplayers,
						playerList: state.players.map((p) => p.name || p),
						ping: state.ping,
					};
				} catch (error) {
					serverStatus[serverConfig.name] = {
						...baseInfo,
						online: false,
						playerCount: 0,
						playerList: [],
					};
				}
			}
		});

		// Wait for all polling to complete (never throws)
		await Promise.allSettled(promises);

		// Run diff + Discord alerts + SSE
		await diffAndBroadcast(serverStatus, lastSnapshot);

		// Update snapshot AFTER diff completes
		lastSnapshot = JSON.parse(JSON.stringify(serverStatus));
	} catch (err) {
		console.error("pollServers fatal error:", err);
	}
};
