import { GameDig } from "gamedig";
import { Rcon } from "rcon-client";
import { SERVERS_TO_QUERY } from "../config/servers.js";
import { broadcastSseEvent } from "../routes/api.js"; // adjust path if needed

// Holds the latest known status
export let serverStatus = {};
SERVERS_TO_QUERY.forEach((s) => {
	serverStatus[s.name] = { online: false, playerList: [], playerCount: 0 };
});

// Snapshot for diffing
let lastSnapshot = {};

// Compare old vs new and broadcast only meaningful changes
function diffAndBroadcast(current, previous) {
	for (const [serverName, cur] of Object.entries(current)) {
		const prev = previous[serverName] || {};

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

	// Detect new servers
	for (const serverName of Object.keys(current)) {
		if (!previous[serverName]) {
			broadcastSseEvent({
				type: "server_added",
				serverName,
				status: current[serverName],
			});
		}
	}

	// Detect removed servers (optional)
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
	const promises = SERVERS_TO_QUERY.map(async (serverConfig) => {
		const baseInfo = {
			sessionName: serverConfig.sessionName,
			serverPassword: serverConfig.serverPassword,
			joinAddress: serverConfig.joinAddress,
			type: serverConfig.type,
		};

		// --- RCON Polling ---
		if (serverConfig.method === "rcon") {
			let rcon;
			try {
				rcon = new Rcon({
					host: serverConfig.host,
					port: serverConfig.rconPort,
					password: serverConfig.rconPassword,
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
				if (rcon) await rcon.end();
			}
		}

		// --- Gamedig Polling ---
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

	await Promise.allSettled(promises);

	// Compare and broadcast changes
	diffAndBroadcast(serverStatus, lastSnapshot);

	// Update snapshot
	lastSnapshot = JSON.parse(JSON.stringify(serverStatus));
};
