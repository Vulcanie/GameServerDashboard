// This file contains the configuration for all your game servers.
// It's separated from the main logic for easy updates.

// 🛑 ACTION REQUIRED: Make sure all paths and details are correct.
export const SERVERS_TO_QUERY = [
	{
		name: "Ark-Ragnarok",
		type: "ark",
		method: "rcon",
		host: "127.0.0.1",
		rconPort: 27025,
		rconPassword: "adminpass",
		sessionName: "GodlyRagnarok",
		serverPassword: "4Honor",
		configPaths: {
			"GameUserSettings.ini":
				"C:/Users/vulca/Desktop/ASA Server/ARK Survival Ascended Ragnarok Server/ShooterGame/Saved/Config/WindowsServer/GameUserSettings.ini",
			"Game.ini":
				"C:/Users/vulca/Desktop/ASA Server/ARK Survival Ascended Ragnarok Server/ShooterGame/Saved/Config/WindowsServer/Game.ini",
		},
		startScriptPath:
			"C:/Users/vulca/Desktop/ASA Server/ARK Survival Ascended Ragnarok Server/Start_Ragnarok.bat",
		workingDir:
			"C:/Users/vulca/Desktop/ASA Server/ARK Survival Ascended Ragnarok Server/",
	},
	{
		name: "Ark-TheIsland",
		type: "ark",
		method: "rcon",
		host: "127.0.0.1",
		rconPort: 27027,
		rconPassword: "adminpass",
		sessionName: "GodlyIsland",
		serverPassword: "4Honor",
		configPaths: {
			"GameUserSettings.ini":
				"C:/Users/vulca/Desktop/ASA Server/ARK Survival Ascended TheIsland Server/ShooterGame/Saved/Config/WindowsServer/GameUserSettings.ini",
			"Game.ini":
				"C:/Users/vulca/Desktop/ASA Server/ARK Survival Ascended TheIsland Server/ShooterGame/Saved/Config/WindowsServer/Game.ini",
		},
		startScriptPath:
			"C:/Users/vulca/Desktop/ASA Server/ARK Survival Ascended TheIsland Server/Start_TheIsland.bat",
		workingDir:
			"C:/Users/vulca/Desktop/ASA Server/ARK Survival Ascended TheIsland Server/",
	},
	{
		name: "Ark-ScorchedEarth",
		type: "ark",
		method: "rcon",
		host: "127.0.0.1",
		rconPort: 27029,
		rconPassword: "adminpass",
		sessionName: "GodlyScorched",
		serverPassword: "4Honor",
		configPaths: {
			"GameUserSettings.ini":
				"C:/Users/vulca/Desktop/ASA Server/ARK Survival Ascended ScorchedEarth Server/ShooterGame/Saved/Config/WindowsServer/GameUserSettings.ini",
			"Game.ini":
				"C:/Users/vulca/Desktop/ASA Server/ARK Survival Ascended ScorchedEarth Server/ShooterGame/Saved/Config/WindowsServer/Game.ini",
		},
		startScriptPath:
			"C:/Users/vulca/Desktop/ASA Server/ARK Survival Ascended ScorchedEarth Server/Start_ScorchedEarth.bat",
		workingDir:
			"C:/Users/vulca/Desktop/ASA Server/ARK Survival Ascended ScorchedEarth Server/",
	},
	{
		name: "Ark-Valguero",
		type: "ark",
		method: "rcon",
		host: "127.0.0.1",
		rconPort: 27031,
		rconPassword: "adminpass",
		sessionName: "GodlyValguero",
		serverPassword: "4Honor",
		configPaths: {
			"GameUserSettings.ini":
				"C:/Users/vulca/Desktop/ASA Server/ARK Survival Ascended Valguero Server/ShooterGame/Saved/Config/WindowsServer/GameUserSettings.ini",
			"Game.ini":
				"C:/Users/vulca/Desktop/ASA Server/ARK Survival Ascended Valguero Server/ShooterGame/Saved/Config/WindowsServer/Game.ini",
		},
		startScriptPath:
			"C:/Users/vulca/Desktop/ASA Server/ARK Survival Ascended Valguero Server/Start_Valguero.bat",
		workingDir:
			"C:/Users/vulca/Desktop/ASA Server/ARK Survival Ascended Valguero Server/",
	},
	{
		name: "MC GodlyMon (Cobbleverse Modpack)",
		type: "minecraft",
		method: "gamedig",
		host: "127.0.0.1",
		port: 25565,
		joinAddress: "50.82.40.123:25565",
		configPath: "C:/Users/vulca/Desktop/Cobblemon server/server.properties",
		startScriptPath: "C:/Users/vulca/Desktop/Cobblemon server/start.bat",
		workingDir: "C:/Users/vulca/Desktop/Cobblemon server",
		rconPort: 25566,
		rconPassword: "adminpass",
	},
	{
		name: "Valheim",
		type: "valheim",
		method: "gamedig",
		host: "127.0.0.1",
		port: 7777,
		sessionName: "GodlyHeroes",
		serverPassword: "4Honor", // Example path
		startScriptPath:
			"C:/Users/vulca/Desktop/Valheim/steamapps/common/Valheim dedicated server/Valheim-Server-Start.bat",
		workingDir:
			"C:/Users/vulca/Desktop/Valheim/steamapps/common/Valheim dedicated server",
		processName: "valheim_server.exe",
	},
	{
		name: "Valheim Modded",
		type: "valheim",
		method: "gamedig",
		host: "127.0.0.1",
		port: 7780,
		sessionName: "Godly Modded",
		serverPassword: "4Honor", // Example path
		startScriptPath:
			"C:/Users/vulca/Desktop/Modded Val Serv/Launch Valheim Server.bat",
		workingDir:
			"C:/Users/vulca/Desktop/Modded Val Serv/steamapps/common/Valheim dedicated server",
		processName: "modded_valheim_server.exe",
	},
	{
		name: "Enshrouded",
		type: "enshrouded",
		method: "gamedig",
		host: "127.0.0.1",
		port: 15637,
		sessionName: "GodlyHeroes",
		serverPassword: "4Honor",
		configPath:
			"C:/Users/vulca/Desktop/Ensh/steamapps/common/EnshroudedServer/enshrouded_server.json",
		startScriptPath:
			"C:/Users/vulca/Desktop/Ensh/Launch Enshrouded Server.bat",
		workingDir:
			"C:/Users/vulca/Desktop/Ensh/steamapps/common/EnshroudedServer",
		processName: "enshrouded_server.exe",
	},
];
