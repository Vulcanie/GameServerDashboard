import { GameDig } from "gamedig";
import { Rcon } from "rcon-client";
import { SERVERS_TO_QUERY } from "../config/servers.js";
import { broadcastSseEvent } from "../routes/api.js"; // adjust path if needed
import { updateDiscordDashboard } from "./discordService.js";
// Holds the latest known status
export let serverStatus = {};
SERVERS_TO_QUERY.forEach((s) => {
	serverStatus[s.name] = { online: false, playerList: [], playerCount: 0 };
});

// Snapshot for diffing
let lastSnapshot = {};

async function diffAndBroadcast(current, previous) {
	let globalChangeDetected = false;

	for (const [serverName, cur] of Object.entries(current)) {
		const prev = previous[serverName];

		// 1. Initial State Handling
		// If this is the very first poll, we skip the "Alerts" to avoid spamming
		// but we still trigger the initial Dashboard update.
		if (!prev) {
			globalChangeDetected = true;
			continue;
		}

		// 2. Online/Offline State Transition
		const statusChanged = cur.online !== prev.online;

		if (statusChanged) {
			globalChangeDetected = true;

			if (cur.online) {
				console.log(`[ALERT] ${serverName} is now ONLINE`);
				await sendDiscordAlert(
					`🟢 Server Online: ${serverName}`,
					`**Session:** ${cur.sessionName || "N/A"}\n**Players:** ${cur.playerCount}`,
					3066993, // Green
				);
			} else {
				console.log(`[ALERT] ${serverName} is now OFFLINE`);
				await sendDiscordAlert(
					`🔴 Server Offline: ${serverName}`,
					`Connection to the server has been lost.`,
					15158332, // Red
				);
			}
		}

		// 3. Player Count / Session Change Detection
		// We trigger a "Global Change" so the Dashboard/SSE updates,
		// but we don't necessarily send a "New Message" alert for every single player join.
		const dataChanged =
			cur.playerCount !== prev.playerCount ||
			cur.sessionName !== prev.sessionName ||
			cur.ping !== prev.ping;

		if (dataChanged) {
			globalChangeDetected = true;
		}

		// 4. SSE Broadcast (Real-time Frontend Update)
		// We send this if status OR data changed for this specific server
		if (statusChanged || dataChanged) {
			broadcastSseEvent({
				type: "server_update",
				serverName,
				status: cur,
			});
			console.log(`[SSE] Broadcasted update for ${serverName}`);
		}
	}

	// 5. Update the Live Discord Dashboard
	// If anything at all changed across any server, we PATCH the dashboard message.
	if (globalChangeDetected) {
		console.log("[Discord] Patching live dashboard message...");
		await updateDiscordDashboard(current);
		console.log("[Discord] Dashboard update complete.");
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

		await updateDiscordDashboard(serverStatus);

		// Update snapshot AFTER diff completes
		lastSnapshot = JSON.parse(JSON.stringify(serverStatus));
	} catch (err) {
		console.error("pollServers fatal error:", err);
	}
};
