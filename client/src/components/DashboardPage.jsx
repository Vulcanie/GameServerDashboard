import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { grey } from "@mui/material/colors";
import ServerCard from "./ServerCard";

// This component is responsible for displaying the main grid of server cards.
function DashboardPage({ servers, loading, onNavigate, apiError }) {
	return (
		<>
			{apiError ? (
				<Typography align="center" color="error" sx={{ mb: 2 }}>
					API error: {apiError}
				</Typography>
			) : null}
			<Typography align="center" sx={{ color: grey[500], mb: 4 }}>
				Auto-refreshing every 5 seconds
			</Typography>
			{loading ? (
				<CircularProgress sx={{ display: "block", mx: "auto" }} />
			) : (
				<Box
					sx={{
						display: "grid",
						gap: 3,
						gridTemplateColumns: "repeat(3, 1fr)",
					}}
				>
					{Object.entries(servers).map(([name, srv]) => (
						<ServerCard
							key={name}
							srv={{ name, ...srv }}
							onClick={() => onNavigate(name)}
						/>
					))}
				</Box>
			)}
		</>
	);
}

export default DashboardPage;
