import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { Card, CardContent, Typography } from "@mui/material";

const socket = io(); // auto-connects to the same origin

export default function Dashboard() {
	const [servers, setServers] = useState({});

	useEffect(() => {
		socket.on("update", (data) => {
			console.log("🔄 Live update:", data);
			setServers(data);
		});

		return () => socket.off("update");
	}, []);

	return (
		<div style={{ display: "grid", gap: "1rem", padding: "1rem" }}>
			{Object.entries(servers).map(([name, info]) => (
				<Card key={name}>
					<CardContent>
						<Typography variant="h5">{name}</Typography>
						<Typography>
							{Array.isArray(info.players)
								? `Players: ${
										info.players.length > 0
											? info.players.join(", ")
											: "None"
								  }`
								: `Players Online: ${info.players ?? 0}`}
						</Typography>
						<Typography>
							Players: {info.players.join(", ") || "None"}
						</Typography>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
