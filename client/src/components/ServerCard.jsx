import React from "react";
import {
	Box,
	Card,
	CardContent,
	Typography,
	Chip,
	List,
	ListItem,
	ListItemText,
	ButtonBase,
	IconButton,
	Tooltip,
} from "@mui/material";
import { green, red, grey } from "@mui/material/colors";
import { ContentCopy as ContentCopyIcon } from "@mui/icons-material";

// Helper function to copy text to clipboard
const copyToClipboard = (text, callback) => {
	const textArea = document.createElement("textarea");
	textArea.value = text;
	document.body.appendChild(textArea);
	textArea.select();
	try {
		document.execCommand("copy");
		callback("Copied!");
	} catch (err) {
		callback("Failed!");
	}
	document.body.removeChild(textArea);
};

// This component displays a single server card on the dashboard.
function ServerCard({ srv, onClick }) {
	const serverName = srv.name || "Unnamed Server";
	const isOnline = srv.online;
	const [copyTooltip, setCopyTooltip] = React.useState("Copy");

	const handleCopy = (text) => {
		copyToClipboard(text, setCopyTooltip);
		setTimeout(() => setCopyTooltip("Copy"), 1500); // Reset tooltip
	};

	return (
		<ButtonBase
			onClick={onClick}
			sx={{
				width: "100%",
				borderRadius: 2,
				textAlign: "left",
				height: "100%",
				transition:
					"transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
				opacity: isOnline ? 1 : 0.7,
				boxShadow: isOnline ? `0 0 8px ${green[900]}` : "none",
				"&:hover": {
					transform: "scale(1.03)",
					boxShadow: isOnline
						? `0 0 15px ${green[700]}`
						: `0 0 15px ${grey[800]}`,
				},
			}}
		>
			<Card
				sx={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<CardContent sx={{ flexGrow: 1 }}>
					<Typography variant="h5" gutterBottom>
						{serverName}
					</Typography>
					<Chip
						label={isOnline ? "ONLINE" : "OFFLINE"}
						sx={{
							backgroundColor: isOnline ? green[500] : red[500],
							color: "white",
							mb: 2,
							fontWeight: "bold",
						}}
					/>

					{/* Join Info Section */}
					<Box sx={{ my: 2 }}>
						{srv.type === "minecraft" && srv.joinAddress && (
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									border: "1px solid",
									borderColor: "grey.700",
									borderRadius: 1,
									p: 1,
								}}
							>
								<Typography variant="body2">
									<strong>Address:</strong> {srv.joinAddress}
								</Typography>
								<Tooltip title={copyTooltip}>
									<IconButton
										size="small"
										onClick={(e) => {
											e.stopPropagation();
											handleCopy(srv.joinAddress);
										}}
									>
										<ContentCopyIcon fontSize="inherit" />
									</IconButton>
								</Tooltip>
							</Box>
						)}
						{srv.type !== "minecraft" && srv.sessionName && (
							<Typography variant="body2" sx={{ mb: 0.5 }}>
								<strong>Session:</strong> {srv.sessionName}
							</Typography>
						)}
						{srv.type !== "minecraft" && srv.serverPassword && (
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
								}}
							>
								<Typography variant="body2">
									<strong>Password:</strong>{" "}
									{srv.serverPassword}
								</Typography>
								<Tooltip title={copyTooltip}>
									<IconButton
										size="small"
										onClick={(e) => {
											e.stopPropagation();
											handleCopy(srv.serverPassword);
										}}
									>
										<ContentCopyIcon fontSize="inherit" />
									</IconButton>
								</Tooltip>
							</Box>
						)}
					</Box>

					{/* Live Stats Section */}
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
						}}
					>
						<Typography variant="body1">
							<strong>Players:</strong> {srv.playerCount ?? 0}
							{srv.maxplayers ? ` / ${srv.maxplayers}` : ""}
						</Typography>
						{isOnline && srv.ping != null && (
							<Typography variant="body1">
								<strong>Ping:</strong> {srv.ping} ms
							</Typography>
						)}
					</Box>

					{/* Player List Section */}
					{srv.playerList && srv.playerList.length > 0 && (
						<>
							<Typography variant="body2" sx={{ mt: 2 }}>
								Player List:
							</Typography>
							<List dense sx={{ paddingTop: 0 }}>
								{srv.playerList.map((p, i) => (
									<ListItem key={i} sx={{ py: 0 }}>
										<ListItemText primary={`• ${p}`} />
									</ListItem>
								))}
							</List>
						</>
					)}
				</CardContent>
			</Card>
		</ButtonBase>
	);
}

export default ServerCard;
