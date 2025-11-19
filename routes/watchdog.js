// watchdog.js
import { Rcon } from "rcon-client";
import { execSync } from "child_process";
import fs from "fs";

// === CONFIG ===
const STEAMCMD_PATH = "C:\\Users\\vulca\\Desktop\\ASA Server\\steamcmd.exe";
const INSTALL_PATH = "C:\\Users\\vulca\\Desktop\\ASA Server\\ARK_SharedInstall";
const APP_ID = 2430930;
const BUILD_TRACK_FILE =
	"C:\\Users\\vulca\\Desktop\\ASA Server\\last_build.txt";

// === SERVER DEFINITIONS ===
// Commented out Ragnarok, but kept in list for reference
const servers = [
	// {
	//  name: "Ragnarok",
	//  host: "127.0.0.1",
	//  port: 27025,
	//  password: "adminpass",
	//  startScript: "C:\\Users\\vulca\\Desktop\\ASA Server\\Ragnarok_Server\\Start_Ragnarok.bat"
	// },
	{
		name: "TheIsland",
		host: "127.0.0.1",
		port: 27027,
		password: "adminpass",
		startScript:
			"C:\\Users\\vulca\\Desktop\\ASA Server\\TheIsland_Server\\Start_TheIsland.bat",
	},
	{
		name: "ScorchedEarth",
		host: "127.0.0.1",
		port: 27029,
		password: "adminpass",
		startScript:
			"C:\\Users\\vulca\\Desktop\\ASA Server\\ScorchedEarth_Server\\Start_ScorchedEarth.bat",
	},
	{
		name: "Valguero",
		host: "127.0.0.1",
		port: 27031,
		password: "adminpass",
		startScript:
			"C:\\Users\\vulca\\Desktop\\ASA Server\\Valguero_Server\\Start_Valguero.bat",
	},
	{
		name: "ClubArk",
		host: "127.0.0.1",
		port: 27033,
		password: "adminpass",
		startScript:
			"C:\\Users\\vulca\\Desktop\\ASA Server\\ClubArk_Server\\Start_ClubArk.bat",
	},
];

// === RCON Helpers ===
async function broadcastAll(message) {
	for (const s of servers) {
		try {
			const rcon = await Rcon.connect({
				host: s.host,
				port: s.port,
				password: s.password,
			});
			await rcon.send(`cheat adminbroadcast ${message}`);
			await rcon.end();
			console.log(`Broadcasted to ${s.name}: ${message}`);
		} catch (err) {
			console.error(`Failed to broadcast to ${s.name}:`, err.message);
		}
	}
}

async function stopAll() {
	for (const s of servers) {
		try {
			const rcon = await Rcon.connect({
				host: s.host,
				port: s.port,
				password: s.password,
			});
			await rcon.send("DoExit");
			await rcon.end();
			console.log(`Stopped ${s.name}`);
		} catch (err) {
			console.error(`Failed to stop ${s.name}:`, err.message);
		}
	}
}

function restartAll() {
	for (const s of servers) {
		console.log(`Restarting ${s.name}...`);
		execSync(`start "" "${s.startScript}"`);
	}
}

// === Update Check ===
function getBuildId() {
	try {
		const output = execSync(
			`"${STEAMCMD_PATH}" +login anonymous +app_info_update 1 +app_info_print ${APP_ID} +quit`,
		).toString();
		const match = output.match(/"buildid"\s+"(\d+)"/);
		return match ? match[1] : null;
	} catch (err) {
		console.error("Failed to query SteamCMD:", err.message);
		return null;
	}
}

async function restartSequence() {
	await broadcastAll("Server will restart in 10 minutes for update!");
	await new Promise((r) => setTimeout(r, 10 * 60 * 1000));
	await broadcastAll("Server will restart in 5 minutes for update!");
	await new Promise((r) => setTimeout(r, 5 * 60 * 1000));
	await broadcastAll("Server will restart in 1 minute for update!");
	await new Promise((r) => setTimeout(r, 1 * 60 * 1000));
	await stopAll();

	console.log("Updating shared ARK install...");
	execSync(
		`"${STEAMCMD_PATH}" +force_install_dir "${INSTALL_PATH}" +login anonymous +app_update ${APP_ID} validate +quit`,
	);

	restartAll();
}

// === Main Loop ===
(async function main() {
	while (true) {
		console.log("Checking for ARK SA update...");
		const newBuild = getBuildId();
		if (!newBuild) {
			console.log("Could not retrieve build ID.");
		} else {
			let oldBuild = null;
			if (fs.existsSync(BUILD_TRACK_FILE)) {
				oldBuild = fs.readFileSync(BUILD_TRACK_FILE, "utf8").trim();
			}
			if (newBuild !== oldBuild) {
				console.log(
					`Update detected! Old: ${oldBuild} New: ${newBuild}`,
				);
				fs.writeFileSync(BUILD_TRACK_FILE, newBuild);
				await restartSequence();
			} else {
				console.log(`No update. Current build: ${newBuild}`);
			}
		}
		await new Promise((r) => setTimeout(r, 15 * 60 * 1000)); // wait 15 minutes
	}
})();
