type BaseServer = {
	type: "ark" | "minecraft" | "valheim" | "enshrouded";
	online: boolean;
	playerCount: number;
	playerList: string[];
};

export type ArkServer = BaseServer & {
	type: "ark";
	sessionName: string;
	serverPassword: string;
	ping?: number;
};

export type MinecraftServer = BaseServer & {
	type: "minecraft";
	joinAddress: string;
	ping: undefined;
};

export type ValheimServer = BaseServer & {
	type: "valheim";
	sessionName: string;
	serverPassword: string;
	ping: undefined;
};

export type EnshroudedServer = BaseServer & {
	type: "enshrouded";
	sessionName: string;
	serverPassword: string;
	ping: undefined;
};

export type GameServer =
	| ArkServer
	| MinecraftServer
	| ValheimServer
	| EnshroudedServer;

export type ServerT = {
	serverName: string;
	serverPing: number | undefined;
	serverFields: ServerField[];
};

export type ServerField = {
	field: string;
	isCopyable: boolean;
};

export type ServerStatus = "online" | "full" | "offline";

export type WithServerName<T> = T & { serverName: string };

export type ServersResponse = Record<string, GameServer>;
