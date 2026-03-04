import fs from "fs";

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const MESSAGE_FILE = "./message_id.json";

export async function updateDiscordDashboard(serverStatus) {
	if (!WEBHOOK_URL) return;

	// 1. Build the fields only for ONLINE servers
	const fields = Object.entries(serverStatus)
		.filter(([_, data]) => data.online)
		.map(([name, data]) => ({
			name: `🎮 ${name}`,
			value: [
				data.sessionName ? `**Session:** ${data.sessionName}` : null,
				data.playerCount !== undefined
					? `**Players:** ${data.playerCount}`
					: null,
				data.ping ? `**Ping:** ${data.ping}ms` : null,
				data.joinAddress ? `**IP:** \`${data.joinAddress}\`` : null,
			]
				.filter(Boolean)
				.join("\n"),
			inline: false,
		}));

	if (fields.length === 0) return; // Or send an "All servers offline" embed

	const payload = {
		embeds: [
			{
				title: "Server Status Dashboard",
				color: 0x00ff00,
				fields: fields,
				timestamp: new Date().toISOString(),
				footer: { text: "Updates automatically when status changes" },
			},
		],
	};

	try {
		let messageId = null;
		if (fs.existsSync(MESSAGE_FILE)) {
			messageId = JSON.parse(fs.readFileSync(MESSAGE_FILE)).id;
		}

		if (!messageId) {
			// Create fresh message
			const res = await fetch(`${WEBHOOK_URL}?wait=true`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const data = await res.json();
			fs.writeFileSync(MESSAGE_FILE, JSON.stringify({ id: data.id }));
		} else {
			// Edit existing message
			await fetch(`${WEBHOOK_URL}/messages/${messageId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
		}
	} catch (err) {
		console.error("Discord Dashboard Update Failed:", err.message);
	}
}
