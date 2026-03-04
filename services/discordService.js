const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export async function sendDiscordAlert(message) {
	if (!WEBHOOK_URL) return;

	const payload = {
		content: message,
	};

	try {
		await fetch(WEBHOOK_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
	} catch (err) {
		console.error("Discord webhook failed:", err.message);
	}
}
