import React from "react";
import {
	Box,
	Card,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Typography,
	IconButton,
	Tooltip,
} from "@mui/material";
import { green, grey } from "@mui/material/colors";
import { ContentCopy as ContentCopyIcon } from "@mui/icons-material";
import { getGameInfo } from "../gameCatalog";
import { copyToClipboard } from "../utils/clipboard";

function StatusDot({ online }) {
	return (
		<Box
			component="span"
			sx={{
				display: "inline-block",
				width: 8,
				height: 8,
				borderRadius: "50%",
				backgroundColor: online ? green[500] : grey[600],
				mr: 1.5,
				flexShrink: 0,
			}}
		/>
	);
}

function CopyableText({ text }) {
	const [tooltip, setTooltip] = React.useState("Copy");

	const handleCopy = (e) => {
		e.stopPropagation();
		copyToClipboard(text, setTooltip);
		setTimeout(() => setTooltip("Copy"), 1500);
	};

	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
			<Typography variant="body2" component="span">
				{text}
			</Typography>
			<Tooltip title={tooltip}>
				<IconButton size="small" onClick={handleCopy}>
					<ContentCopyIcon sx={{ fontSize: 14 }} />
				</IconButton>
			</Tooltip>
		</Box>
	);
}

function GameCard({ gameType, instances, onNavigate, userRole, showOffline }) {
	const { title, banner, gradient } = getGameInfo(gameType);

	const rows = showOffline
		? instances
		: instances.filter((i) => i.online);

	if (rows.length === 0) return null;

	const hasSession = instances.some((i) => i.sessionName);
	const hasIp = instances.some((i) => i.joinAddress);
	const hasPing = instances.some((i) => i.ping != null);
	const hasPassword = instances.some((i) => i.serverPassword);

	const clickable = userRole === "admin";

	return (
		<Card sx={{ overflow: "hidden" }}>
			<Box
				sx={{
					position: "relative",
					height: 180,
					backgroundImage: banner
						? `url(${banner})`
						: gradient,
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			>
				<Box
					sx={{
						position: "absolute",
						inset: 0,
						background:
							"linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0) 100%)",
					}}
				/>
				<Typography
					variant="h5"
					sx={{
						position: "absolute",
						left: 16,
						bottom: 12,
						color: "white",
						fontWeight: 600,
						textShadow: "0 1px 4px rgba(0,0,0,0.6)",
					}}
				>
					{title}
				</Typography>
			</Box>

			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell sx={{ color: grey[500] }}>Name</TableCell>
						{hasSession && (
							<TableCell sx={{ color: grey[500] }}>Session</TableCell>
						)}
						{hasIp && <TableCell sx={{ color: grey[500] }}>IP</TableCell>}
						<TableCell sx={{ color: grey[500] }}>Players</TableCell>
						{hasPing && (
							<TableCell sx={{ color: grey[500] }}>Ping</TableCell>
						)}
						{hasPassword && (
							<TableCell sx={{ color: grey[500] }}>Password</TableCell>
						)}
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.map((srv) => (
						<TableRow
							key={srv.name}
							hover={clickable}
							onClick={
								clickable ? () => onNavigate(srv.name) : undefined
							}
							sx={{
								cursor: clickable ? "pointer" : "default",
								opacity: srv.online ? 1 : 0.6,
								"&:last-child td": { border: 0 },
							}}
						>
							<TableCell>
								<Box sx={{ display: "flex", alignItems: "center" }}>
									<StatusDot online={srv.online} />
									{srv.name}
								</Box>
							</TableCell>
							{hasSession && (
								<TableCell>{srv.sessionName || "—"}</TableCell>
							)}
							{hasIp && <TableCell>{srv.joinAddress || "—"}</TableCell>}
							<TableCell>
								{srv.playerCount ?? 0}
								{srv.maxplayers ? ` / ${srv.maxplayers}` : ""}
							</TableCell>
							{hasPing && (
								<TableCell>
									{srv.online && srv.ping != null ? `${srv.ping} ms` : "—"}
								</TableCell>
							)}
							{hasPassword && (
								<TableCell>
									{srv.serverPassword ? (
										<CopyableText text={srv.serverPassword} />
									) : (
										"—"
									)}
								</TableCell>
							)}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Card>
	);
}

export default GameCard;
