import type {
	ArkServer,
	EnshroudedServer,
	MinecraftServer,
	ServerField,
	ServerT,
	ValheimServer,
	WithServerName,
} from "./types";

export function ConvertValheimServers(
	servers: WithServerName<ValheimServer>[],
): ServerT[] {
	return servers.map((server) => ({
		serverName: server.serverName,
		serverPing: server.ping,
		serverFields: [
			f(server.serverName),
			f(server.sessionName),
			f(server.playerCount.toString()),
			f(server.serverPassword, true),
		],
	}));
}

export function ConvertArkServers(
	servers: WithServerName<ArkServer>[],
): ServerT[] {
	return servers.map((server) => ({
		serverName: server.serverName,
		serverPing: server.ping,
		serverFields: [
			f(server.serverName),
			f(server.sessionName),
			f(server.playerCount.toString()),
			f(server.ping ? server.ping.toString() : ""),
			f(server.serverPassword, true),
		],
	}));
}

export function convertMinecraftServers(
	servers: WithServerName<MinecraftServer>[],
): ServerT[] {
	return servers.map((server) => ({
		serverName: server.serverName,
		serverPing: server.ping,
		serverFields: [
			f(server.serverName),
			f(server.joinAddress, true),
			f(server.playerCount.toString()),
		],
	}));
}

export function convertEnshroudedServers(
	servers: WithServerName<EnshroudedServer>[],
): ServerT[] {
	return servers.map((server) => ({
		serverName: server.serverName,
		serverPing: server.ping,
		serverFields: [
			f(server.serverName),
            f(server.sessionName),
            f(server.serverPassword, true),
			f(server.playerCount.toString()),
		],
	}));
}

function f(input: string, isCopyable = false): ServerField {
	return {field: input, isCopyable: isCopyable}
}