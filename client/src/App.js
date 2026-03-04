import React from "react";
import {
	Container,
	Typography,
	ThemeProvider,
	CssBaseline,
} from "@mui/material";
import { darkTheme } from "./theme";
import DashboardPage from "./components/DashboardPage";
import ConfigPage from "./components/ConfigPage";
import LoginPage from "./components/LoginPage";
import BatchFileEditor from "./components/BatchFileEditor";

// ✅ Centralized API base URL
const API_BASE =
	process.env.REACT_APP_API_URL?.trim().replace(/\/+$/, "") || "";
console.log("🌐 Using API base:", API_BASE || "(relative)");

function App() {
	const [page, setPage] = React.useState("dashboard");
	const [selectedServer, setSelectedServer] = React.useState(null);
	const [servers, setServers] = React.useState({});
	const [apiError, setApiError] = React.useState(null);
	const [loading, setLoading] = React.useState(true);
	const [userRole, setUserRole] = React.useState(() => {
		return localStorage.getItem("userRole") || null;
	});

	React.useEffect(() => {
		const joinUrl = (base, path) =>
			`${base}/${path}`.replace(/\/+/g, "/").replace(":/", "://");

		// --- 1. Initial fetch (so UI loads instantly) ---
		const fetchInitial = async () => {
			try {
				const url = joinUrl(API_BASE, "/api/status");
				const res = await fetch(url, {
					headers: {
						Accept: "application/json",
						"ngrok-skip-browser-warning": "true",
					},
				});

				if (!res.ok) throw new Error(`HTTP ${res.status}`);

				const data = await res.json();
				setServers(data);
				setApiError(null);
			} catch (err) {
				console.error("Initial fetch failed:", err);
				setApiError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchInitial();

		// --- 2. SSE live updates ---
		const eventsUrl = joinUrl(API_BASE, "/api/events");
		const events = new EventSource(eventsUrl);

		events.onmessage = (event) => {
			if (!event.data) return;

			const data = JSON.parse(event.data);

			switch (data.type) {
				case "connected":
					console.log("SSE connected");
					break;

				case "server_update":
					setServers((prev) => ({
						...prev,
						[data.serverName]: data.status,
					}));
					break;

				case "server_added":
					setServers((prev) => ({
						...prev,
						[data.serverName]: data.status,
					}));
					break;

				case "server_removed":
					setServers((prev) => {
						const copy = { ...prev };
						delete copy[data.serverName];
						return copy;
					});
					break;

				default:
					console.warn("Unknown SSE event:", data);
			}
		};

		events.onerror = (err) => {
			console.error("SSE error:", err);
			setApiError("Lost connection to live updates");
		};

		// Cleanup on unmount
		return () => {
			events.close();
		};
	}, []);

	const navigateToConfig = (serverName) => {
		setSelectedServer(serverName);
		setPage("config");
	};

	const navigateToDashboard = () => {
		setSelectedServer(null);
		setPage("dashboard");
	};

	const navigateToBatchEditor = () => {
		setPage("batchEditor");
	};

	const selectedServerData = servers[selectedServer] || null;

	if (!userRole) {
		return (
			<ThemeProvider theme={darkTheme}>
				<CssBaseline />
				<LoginPage
					onLogin={(role) => {
						setUserRole(role);
						localStorage.setItem("userRole", role);
					}}
				/>
			</ThemeProvider>
		);
	}

	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<Container sx={{ mt: 4, mb: 4 }}>
				<Typography variant="h3" align="center" gutterBottom>
					GodlyHeroes Server Dashboard
				</Typography>

				{page === "dashboard" ? (
					<DashboardPage
						servers={servers}
						loading={loading}
						onNavigate={navigateToConfig}
						apiError={apiError}
						userRole={userRole}
					/>
				) : page === "config" ? (
					<ConfigPage
						serverName={selectedServer}
						serverStatus={selectedServerData}
						onBack={navigateToDashboard}
						userRole={userRole}
						onEditBatchFiles={navigateToBatchEditor} // ✅ Pass handler
					/>
				) : page === "batchEditor" ? (
					<BatchFileEditor
						serverName={selectedServer}
						onBack={navigateToConfig}
					/>
				) : null}
			</Container>
		</ThemeProvider>
	);
}

export default App;
