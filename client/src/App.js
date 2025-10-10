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

function App() {
	const [page, setPage] = React.useState("dashboard");
	const [selectedServer, setSelectedServer] = React.useState(null);
	const [servers, setServers] = React.useState({});
	const [apiError, setApiError] = React.useState(null);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		const API_BASE = process.env.REACT_APP_API_URL || "";
		console.log("Using API base:", API_BASE);

		function joinUrl(base, path) {
			if (!base) return path;
			return base.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
		}

		const fetchData = async () => {
			try {
				const url = joinUrl(API_BASE, "/api/status");
				const res = await fetch(url, {
					headers: {
						Accept: "application/json",
						"ngrok-skip-browser-warning": "true",
					},
				});

				const contentType = res.headers.get("content-type");
				if (!contentType?.includes("application/json")) {
					const raw = await res.text();
					console.warn("Unexpected response format:", raw);
					throw new Error("Invalid response format: not JSON");
				}

				if (!res.ok) {
					throw new Error(`HTTP ${res.status} ${res.statusText}`);
				}

				let data;
				try {
					data = await res.json();
				} catch (parseErr) {
					const raw = await res.text();
					console.error("Failed to parse JSON. Raw response:", raw);
					throw new Error("Invalid JSON response");
				}
				setServers(data);

				setApiError(null);
			} catch (err) {
				console.error("Error fetching data:", err);
				setServers({});
				setApiError(err.message || String(err));
			} finally {
				setLoading(false);
			}
		};

		fetchData();
		const interval = setInterval(fetchData, 5000);
		return () => clearInterval(interval);
	}, []);

	const navigateToConfig = (serverName) => {
		setSelectedServer(serverName);
		setPage("config");
	};

	const navigateToDashboard = () => {
		setSelectedServer(null);
		setPage("dashboard");
	};

	const selectedServerData = servers[selectedServer] || null;

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
					/>
				) : (
					<ConfigPage
						serverName={selectedServer}
						serverStatus={selectedServerData}
						onBack={navigateToDashboard}
					/>
				)}
			</Container>
		</ThemeProvider>
	);
}

export default App;
