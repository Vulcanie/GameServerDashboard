import React from "react";
import {
	Box,
	Typography,
	Button,
	CircularProgress,
	Tabs,
	Tab,
	TextareaAutosize,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { grey } from "@mui/material/colors";
import StatusDisplay from "./StatusDisplay";

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

	// ✅ Centralized and sanitized API base
	const API_BASE =
		process.env.REACT_APP_API_URL?.trim().replace(/\/+$/, "") || "";
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

	const currentConfigName = serverInfo?.configNames?.[activeTab];

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
					>
						Stop Server
					</Button>
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
				<StatusDisplay serverStatus={serverStatus} />
			</Box>
		);
	}

	return (
		<Box sx={{ pb: "120px" }}>
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

			{loading ? (
				<CircularProgress />
			) : (
				<>
					{serverInfo?.configNames?.length > 1 && (
						<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
							<Tabs value={activeTab} onChange={handleTabChange}>
								{serverInfo.configNames.map((name) => (
									<Tab label={name} key={name} />
								))}
							</Tabs>
						</Box>
					)}
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
