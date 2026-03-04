import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MESSAGE_FILE = path.join(__dirname, "message_id.json");

// HARDCODED URL FOR TESTING
const WEBHOOK_URL =
	"https://discord.com/api/webhooks/1478623363550150847/f_tfwqjHzuEGMKbsJgLY49vkRLzrExmN1Cg0mjAaldPydBD4z9onuhyHb-1kSZV6jmnl";

export async function updateDiscordDashboard(serverStatus) {
	console.log("--- 🏁 Discord Update Function Started ---");

	// Check if any servers are actually online
	const onlineServers = Object.entries(serverStatus).filter(
		([_, data]) => data.online,
	);

	console.log(`[Debug] Servers found online: ${onlineServers.length}`);

	if (onlineServers.length === 0) {
		console.log(
			"⚠️ No servers are online. Skipping Discord update to keep dashboard clean.",
		);
		return;
	}

	const fields = onlineServers.map(([name, data]) => ({
		name: `🎮 ${name}`,
		value: `**Players:** ${data.playerCount}\n**Status:** Online`,
		inline: true,
	}));

	const payload = {
		embeds: [
			{
				title: "Live Server Monitor",
				color: 0x00ff00,
				fields: fields,
				footer: { text: "Hardcoded Test Mode" },
				timestamp: new Date(),
			},
		],
	};

	try {
		let messageId = null;
		if (fs.existsSync(MESSAGE_FILE)) {
			const fileContent = fs.readFileSync(MESSAGE_FILE, "utf-8");
			messageId = JSON.parse(fileContent).id;
			console.log(
				`[Debug] Found existing Message ID in file: ${messageId}`,
			);
		}

		if (!messageId) {
			console.log("[Action] Sending NEW message to Discord...");
			const res = await fetch(`${WEBHOOK_URL}?wait=true`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const data = await res.json();
			if (res.ok) {
				fs.writeFileSync(MESSAGE_FILE, JSON.stringify({ id: data.id }));
				console.log("✅ SUCCESS: New message posted and ID saved.");
			} else {
				console.error("❌ Discord POST Error:", data);
			}
		} else {
			console.log("[Action] Patching existing message...");
			const res = await fetch(`${WEBHOOK_URL}/messages/${messageId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (res.ok) {
				console.log("✅ SUCCESS: Message updated.");
			} else {
				const errData = await res.json();
				console.error("❌ Discord PATCH Error:", errData);

				if (res.status === 404) {
					console.log(
						"Emptying stale message_id.json and retrying...",
					);
					fs.unlinkSync(MESSAGE_FILE);
				}
			}
		}
	} catch (err) {
		console.error("❌ Network/Fetch Error:", err.message);
	}
}
