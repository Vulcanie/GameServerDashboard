import React from "react";
import {
	Box,
	Typography,
	Button,
	CircularProgress,
	Tabs,
	Tab,
	TextareaAutosize,
	FormControlLabel,
	Switch,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { grey } from "@mui/material/colors";
import StatusDisplay from "./StatusDisplay";
import ConfigForm from "./ConfigForm";
import RconConsole from "./RconConsole";
import { parseIni, serializeIni } from "../configParsers/ini";
import { parseProperties, serializeProperties } from "../configParsers/properties";
import { parseXmlProperties, serializeXmlProperties } from "../configParsers/xmlProperties";
import {
	parseJsonConfig,
	serializeJsonConfig,
	flattenJsonEntries,
} from "../configParsers/json";
import { parsePalworldStruct, serializePalworldStruct } from "../configParsers/palworldStruct";
import { annotateEntries, getFileParser, getStructuredPaths } from "../configCatalog";
import { detectSettingType } from "../utils/settingType";

const PARSERS = {
	ini: { parse: parseIni, serialize: serializeIni, getEntries: (p) => p.entries },
	properties: {
		parse: parseProperties,
		serialize: serializeProperties,
		getEntries: (p) => p.entries,
	},
	xml: {
		parse: parseXmlProperties,
		serialize: serializeXmlProperties,
		getEntries: (p) => p.entries,
	},
	json: {
		parse: parseJsonConfig,
		serialize: serializeJsonConfig,
		getEntries: (p, structuredPaths) =>
			flattenJsonEntries(p, new Set(structuredPaths)),
	},
	palworld: {
		parse: parsePalworldStruct,
		serialize: serializePalworldStruct,
		getEntries: (p) => p.entries,
	},
};

function ConfigPage({
	serverName,
	serverStatus,
	onBack,
	userRole,
	onEditBatchFiles,
}) {
	const [serverInfo, setServerInfo] = React.useState(null);
	const [configs, setConfigs] = React.useState({});
	const [activeTab, setActiveTab] = React.useState(0);
	const [message, setMessage] = React.useState("");
	const [loading, setLoading] = React.useState(true);
	const [viewRaw, setViewRaw] = React.useState(false);
	const [updateDialogOpen, setUpdateDialogOpen] = React.useState(false);

	// ✅ Centralized and sanitized API base
	const API_BASE =
		process.env.REACT_APP_API_URL?.trim().replace(/\/+$/, "") || "";
	const API_KEY = process.env.REACT_APP_API_KEY;
	const joinUrl = (base, path) =>
		`${base}/${path}`.replace(/\/+/g, "/").replace(":/", "://");

	React.useEffect(() => {
		const fetchServerInfo = async () => {
			try {
				setLoading(true);
				const infoRes = await fetch(
					`${API_BASE}/api/server/${serverName}?t=${Date.now()}`,
					{
						headers: {
							Accept: "application/json",
							"ngrok-skip-browser-warning": "true",
							"Access-Control-Allow-Origin": "*",
						},
					},
				);
				if (!infoRes.ok) throw new Error("Failed to fetch server info");
				const infoData = await infoRes.json();
				setServerInfo(infoData);

				if (infoData.configNames && infoData.configNames.length > 0) {
					const newConfigs = {};
					for (const name of infoData.configNames) {
						const configRes = await fetch(
							joinUrl(
								API_BASE,
								`/api/config/${serverName}?file=${name}&t=${Date.now()}`,
							),
							{
								headers: {
									Accept: "application/json",
									"ngrok-skip-browser-warning": "true",
									"Access-Control-Allow-Origin": "*",
								},
							},
						);
						const configData = await configRes.json();
						newConfigs[name] =
							configData.content ||
							`Could not load content for ${name}`;
					}
					setConfigs(newConfigs);
				}
			} catch (err) {
				setMessage(
					"Error connecting to the server to get config details.",
				);
			} finally {
				setLoading(false);
			}
		};

		if (userRole === "admin") {
			fetchServerInfo();
		}
	}, [serverName, userRole]);

	const handleTabChange = (event, newValue) => {
		setActiveTab(newValue);
	};

	const handleSave = async () => {
		const activeConfigName = serverInfo.configNames[activeTab];
		const activeConfigContent = configs[activeConfigName];
		setMessage(`Saving ${activeConfigName}...`);
		try {
			const res = await fetch(
				joinUrl(API_BASE, `/api/config/${serverName}`),
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-api-key": API_KEY,
						"ngrok-skip-browser-warning": "true",
						"Access-Control-Allow-Origin": "*",
					},
					body: JSON.stringify({
						fileName: activeConfigName,
						content: activeConfigContent,
					}),
				},
			);
			const data = await res.json();
			setMessage(data.message || data.error);
		} catch (err) {
			setMessage("Failed to send save request.");
		}
	};

	const handleControl = async (action) => {
		setMessage(`Sending ${action} command...`);
		try {
			const res = await fetch(
				joinUrl(API_BASE, `/api/control/${serverName}/${action}`),
				{
					method: "POST",
					headers: {
						"x-api-key": API_KEY,
						"ngrok-skip-browser-warning": "true",
						"Access-Control-Allow-Origin": "*",
					},
				},
			);
			const data = await res.json();
			setMessage(data.message || data.error);
		} catch (err) {
			setMessage("Failed to send control command.");
		}
	};

	const handleConfirmUpdate = () => {
		setUpdateDialogOpen(false);
		handleControl("update");
	};

	const currentConfigName = serverInfo?.configNames?.[activeTab];
	const gameType = serverStatus?.type;
	const parserType = currentConfigName
		? getFileParser(gameType, currentConfigName)
		: null;
	const parserDef = parserType ? PARSERS[parserType] : null;
	const rawText = currentConfigName ? configs[currentConfigName] || "" : "";
	const structuredPaths = React.useMemo(
		() =>
			currentConfigName ? getStructuredPaths(gameType, currentConfigName) : [],
		[gameType, currentConfigName],
	);

	const parsed = React.useMemo(() => {
		if (!parserDef || !rawText) return null;
		try {
			return parserDef.parse(rawText);
		} catch (e) {
			return null;
		}
	}, [parserDef, rawText]);

	const groups = React.useMemo(() => {
		if (!parsed || !parserDef || !currentConfigName) return [];
		const entries = parserDef.getEntries(parsed, structuredPaths);
		return annotateEntries(gameType, currentConfigName, entries).groups;
	}, [parsed, parserDef, currentConfigName, gameType, structuredPaths]);

	const handleSettingChange = (entry, rawNewValue) => {
		if (!parserDef || !parsed || !currentConfigName) return;
		let newValue = rawNewValue;
		if (parserType === "json" && !entry.structured) {
			if (entry.rawJson) {
				try {
					newValue = JSON.parse(rawNewValue);
				} catch (e) {
					newValue = rawNewValue;
				}
			} else {
				const type = detectSettingType(entry.value);
				if (type === "boolean") {
					newValue = String(rawNewValue).toLowerCase() === "true";
				} else if (type === "number") {
					newValue = rawNewValue === "" ? rawNewValue : Number(rawNewValue);
				}
			}
		}
		const newText = parserDef.serialize(parsed, { [entry.id]: newValue });
		setConfigs((prev) => ({ ...prev, [currentConfigName]: newText }));
	};

	const parseFailed = Boolean(parserDef && rawText && !parsed);
	const showRaw = viewRaw || parseFailed;
	const isArk = gameType === "ark";

	const updateDialog = (
		<Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)}>
			<DialogTitle>Update {serverName}?</DialogTitle>
			<DialogContent>
				<DialogContentText>
					{isArk
						? "This will stop every ARK server sharing this install (all the ASA maps), run the SteamCMD update, and leave them stopped when it's done. You'll need to start them back up manually."
						: "This will stop this server, run the SteamCMD update, and leave it stopped when it's done. You'll need to start it back up manually."}
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
				<Button
					variant="contained"
					color="warning"
					onClick={handleConfirmUpdate}
				>
					Update
				</Button>
			</DialogActions>
		</Dialog>
	);

	if (userRole !== "admin") {
		return (
			<Box sx={{ mt: 4 }}>
				<Box sx={{ display: "flex", gap: 2, mb: 2 }}>
					<Button startIcon={<ArrowBackIcon />} onClick={onBack}>
						Back to Dashboard
					</Button>
				</Box>

				<Typography variant="h5" color="warning.main">
					Access Denied: Guest users cannot view or edit server
					configurations.
				</Typography>
			</Box>
		);
	}

	// ✅ Handle servers with no config files
	if (!loading && serverInfo?.configNames?.length === 0) {
		return (
			<Box sx={{ mt: 4 }}>
				{updateDialog}
				<Box sx={{ display: "flex", gap: 2, mb: 2 }}>
					<Button startIcon={<ArrowBackIcon />} onClick={onBack}>
						Back to Dashboard
					</Button>

					{userRole === "admin" && (
						<Button
							variant="outlined"
							color="warning"
							onClick={onEditBatchFiles}
						>
							Edit Batch Files
						</Button>
					)}
				</Box>

				<Typography variant="h5" color="info.main">
					This server does not have any editable config files.
				</Typography>
				<Box sx={{ mt: 3 }}>
					<Button
						variant="contained"
						color="success"
						onClick={() => handleControl("start")}
						sx={{ mr: 2 }}
					>
						Start Server
					</Button>
					<Button
						variant="contained"
						color="error"
						onClick={() => handleControl("stop")}
						sx={{ mr: serverInfo?.hasUpdate ? 2 : 0 }}
					>
						Stop Server
					</Button>
					{serverInfo?.hasUpdate && (
						<Button
							variant="contained"
							color="warning"
							onClick={() => setUpdateDialogOpen(true)}
						>
							Update Server
						</Button>
					)}
					{message && (
						<Typography
							variant="body2"
							sx={{
								color: grey[400],
								mt: 2,
								fontStyle: "italic",
							}}
						>
							Status: {message}
						</Typography>
					)}
				</Box>
				{serverInfo?.hasRcon && (
					<RconConsole apiBase={API_BASE} serverName={serverName} />
				)}
				<StatusDisplay serverStatus={serverStatus} />
			</Box>
		);
	}

	return (
		<Box sx={{ pb: "120px" }}>
			{updateDialog}
			<Box sx={{ display: "flex", gap: 2, mb: 2 }}>
				<Button startIcon={<ArrowBackIcon />} onClick={onBack}>
					Back to Dashboard
				</Button>

				{userRole === "admin" && (
					<Button
						variant="outlined"
						color="warning"
						onClick={onEditBatchFiles}
					>
						Edit Batch Files
					</Button>
				)}
			</Box>

			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					mb: 2,
				}}
			>
				<Box>
					<Typography variant="h4">
						{serverName} - Configuration
					</Typography>
					<Box
						sx={{
							display: "flex",
							gap: 2,
							my: 2,
							alignItems: "center",
							minHeight: "40px",
						}}
					>
						<Button
							variant="contained"
							color="success"
							onClick={() => handleControl("start")}
						>
							Start Server
						</Button>
						<Button
							variant="contained"
							color="error"
							onClick={() => handleControl("stop")}
						>
							Stop Server
						</Button>
						{serverInfo?.hasUpdate && (
							<Button
								variant="contained"
								color="warning"
								onClick={() => setUpdateDialogOpen(true)}
							>
								Update Server
							</Button>
						)}
						{message && (
							<Typography
								variant="body2"
								sx={{
									color: grey[400],
									ml: 2,
									fontStyle: "italic",
								}}
							>
								Status: {message}
							</Typography>
						)}
					</Box>
				</Box>

				<StatusDisplay serverStatus={serverStatus} />
			</Box>

			{serverInfo?.hasRcon && (
				<RconConsole apiBase={API_BASE} serverName={serverName} />
			)}

			{loading ? (
				<CircularProgress />
			) : (
				<>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							borderBottom: 1,
							borderColor: "divider",
						}}
					>
						{serverInfo?.configNames?.length > 1 ? (
							<Tabs value={activeTab} onChange={handleTabChange}>
								{serverInfo.configNames.map((name) => (
									<Tab label={name} key={name} />
								))}
							</Tabs>
						) : (
							<Box />
						)}
						{parserDef && (
							<FormControlLabel
								sx={{ mr: 0 }}
								control={
									<Switch
										checked={showRaw}
										disabled={parseFailed}
										onChange={(e) => setViewRaw(e.target.checked)}
									/>
								}
								label="View Raw"
							/>
						)}
					</Box>

					{parseFailed && (
						<Typography variant="body2" sx={{ color: "warning.main", mt: 1 }}>
							Couldn't parse this file into settings (it may have
							invalid syntax) — showing raw text instead.
						</Typography>
					)}

					{!parserDef || showRaw ? (
						<TextareaAutosize
							value={configs[currentConfigName] || ""}
							onChange={(e) =>
								setConfigs((prev) => ({
									...prev,
									[currentConfigName]: e.target.value,
								}))
							}
							minRows={25}
							style={{
								width: "100%",
								backgroundColor: "#2b2b2b",
								color: "white",
								fontFamily: "monospace",
								fontSize: 14,
								border: "1px solid #555",
								borderRadius: 4,
								padding: "10px",
								marginTop: "16px",
							}}
						/>
					) : groups.length === 0 ? (
						<Typography variant="body2" sx={{ color: grey[500], mt: 2 }}>
							No editable settings found in this file.
						</Typography>
					) : (
						<Box sx={{ mt: 2 }}>
							<ConfigForm groups={groups} onChange={handleSettingChange} />
						</Box>
					)}
				</>
			)}

			<Box
				sx={{
					position: "fixed",
					bottom: 0,
					left: 0,
					right: 0,
					p: 2,
					backgroundColor: "rgba(30, 30, 30, 0.9)",
					backdropFilter: "blur(5px)",
					borderTop: "1px solid",
					borderColor: "divider",
					zIndex: 1100,
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<Button
					variant="contained"
					onClick={handleSave}
					disabled={loading || !currentConfigName}
				>
					Save {currentConfigName}
				</Button>
			</Box>
		</Box>
	);
}

export default ConfigPage;
