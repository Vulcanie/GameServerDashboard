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

function ConfigPage({ serverName, serverStatus, onBack, userRole }) {
	const [serverInfo, setServerInfo] = React.useState(null);
	const [configs, setConfigs] = React.useState({});
	const [activeTab, setActiveTab] = React.useState(0);
	const [message, setMessage] = React.useState("");
	const [loading, setLoading] = React.useState(true);

	const API_BASE = process.env.REACT_APP_API_URL || "";

	React.useEffect(() => {
		const fetchServerInfo = async () => {
			try {
				setLoading(true);
				const infoRes = await fetch(
					`${API_BASE}/api/server/${serverName}?=${Date.now()}`,
					{
						headers: {
							Accept: "application/json",
							"ngrok-skip-browser-warning": "true",
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
							`${API_BASE}/api/config/${serverName}?file=${name}&t=${Date.now()}`,
							{
								headers: {
									Accept: "application/json",
									"ngrok-skip-browser-warning": "true",
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
			const res = await fetch(`${API_BASE}/api/config/${serverName}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					fileName: activeConfigName,
					content: activeConfigContent,
				}),
			});
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
				`${API_BASE}/api/control/${serverName}/${action}`,
				{
					method: "POST",
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
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={onBack}
					sx={{ mb: 2 }}
				>
					Back to Dashboard
				</Button>
				<Typography variant="h5" color="warning.main">
					Access Denied: Guest users cannot view or edit server
					configurations.
				</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ pb: "120px" }}>
			<Button
				startIcon={<ArrowBackIcon />}
				onClick={onBack}
				sx={{ mb: 2 }}
			>
				Back to Dashboard
			</Button>

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
					{serverInfo &&
						serverInfo.configNames &&
						serverInfo.configNames.length > 1 && (
							<Box
								sx={{ borderBottom: 1, borderColor: "divider" }}
							>
								<Tabs
									value={activeTab}
									onChange={handleTabChange}
								>
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
