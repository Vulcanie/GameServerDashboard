import { GameDig } from "gamedig";
import { Rcon } from "rcon-client";
import { SERVERS_TO_QUERY } from "../config/servers.js";

// This will hold the latest status of all servers and is exported
// so the api.js file can access it directly.
export let serverStatus = {};
SERVERS_TO_QUERY.forEach((s) => {
	serverStatus[s.name] = { online: false, players: [], playerCount: 0 };
});

// This function polls all servers and updates the shared status object.
// It takes the `io` instance as an argument to broadcast updates.
export const pollServers = async (io) => {
	const promises = SERVERS_TO_QUERY.map(async (serverConfig) => {
		// This object holds static info we want to send to the frontend.
		const baseInfo = {
			sessionName: serverConfig.sessionName,
			serverPassword: serverConfig.serverPassword,
			joinAddress: serverConfig.joinAddress,
			type: serverConfig.type,
		};

		// --- RCON Polling Logic ---
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

				// Update status with live and static info
				serverStatus[serverConfig.name] = {
					...baseInfo,
					online: true,
					playerCount: players.length,
					playerList: players,
					ping: ping,
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
		// --- Gamedig Polling Logic ---
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

	// Wait for all server checks to complete.
	await Promise.allSettled(promises);

	// Broadcast the fresh data to all connected clients.
	if (io) {
		io.emit("update", serverStatus);
	}
};
