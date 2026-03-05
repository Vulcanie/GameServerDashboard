import type {
	ArkServer,
	EnshroudedServer,
	MinecraftServer,
	ServerT,
	ValheimServer,
	WithServerName,
} from "./types";

export function ConvertValheimServers(
	servers: WithServerName<ValheimServer>[],
): ServerT[] {
	return servers.map((server) => ({
		serverName: server.serverName,
		serverFields: [
			server.serverName,
			server.sessionName,
			server.playerCount.toString(),
			server.serverPassword,
		],
	}));
}

export function ConvertArkServers(
	servers: WithServerName<ArkServer>[],
): ServerT[] {
	return servers.map((server) => ({
		serverName: server.serverName,
		serverFields: [
			server.serverName,
			server.sessionName,
			server.playerCount.toString(),
			server.ping ? server.ping.toString() : "",
			server.serverPassword,
		],
	}));
}

export function convertMinecraftServers(
	servers: WithServerName<MinecraftServer>[],
): ServerT[] {
	return servers.map((server) => ({
		serverName: server.serverName,
		serverFields: [
			server.serverName,
			server.joinAddress,
			server.playerCount.toString(),
		],
	}));
}

export function convertEnshroudedServers(
	servers: WithServerName<EnshroudedServer>[],
): ServerT[] {
	return servers.map((server) => ({
		serverName: server.serverName,
		serverFields: [
			server.serverName,
            server.sessionName,
            server.serverPassword,
			server.playerCount.toString(),
		],
	}));
}
