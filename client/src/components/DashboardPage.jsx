import React from "react";
import {
	Box,
	Typography,
	FormControlLabel,
	Switch,
	CircularProgress,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import GameCard from "./GameCard";

// Groups the flat servers map into { [type]: [{name, ...status}] }
function groupByType(servers) {
	const groups = {};
	for (const [name, status] of Object.entries(servers)) {
		const type = status.type || "unknown";
		if (!groups[type]) groups[type] = [];
		groups[type].push({ name, ...status });
	}
	return groups;
}

// This component displays the main grid of game cards, each listing its server instances.
function DashboardPage({ servers, loading, onNavigate, apiError, userRole }) {
	const [showOffline, setShowOffline] = React.useState(true);

	const groups = groupByType(servers);
	const gameTypes = Object.keys(groups).filter((type) =>
		showOffline ? true : groups[type].some((s) => s.online),
	);

	return (
		<>
			{apiError ? (
				<Typography align="center" color="error" sx={{ mb: 2 }}>
					API error: {apiError}
				</Typography>
			) : null}

			<Typography align="center" sx={{ color: grey[500], mb: 2 }}>
				Live updates enabled (SSE)
			</Typography>

			<Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
				<FormControlLabel
					control={
						<Switch
							checked={showOffline}
							onChange={(e) => setShowOffline(e.target.checked)}
						/>
					}
					label="Show Offline"
				/>
			</Box>

			{loading ? (
				<CircularProgress sx={{ display: "block", mx: "auto" }} />
			) : (
				<Box
					sx={{
						display: "grid",
						gap: 3,
						gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
					}}
				>
					{gameTypes.map((type) => (
						<GameCard
							key={type}
							gameType={type}
							instances={groups[type]}
							onNavigate={onNavigate}
							userRole={userRole}
							showOffline={showOffline}
						/>
					))}
				</Box>
			)}
		</>
	);
}

export default DashboardPage;
