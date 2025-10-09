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

// This is the main component for your frontend.
// It manages which page is visible and holds the live server status data.
function App() {
	// State to track the current view ('dashboard' or 'config')
	const [page, setPage] = React.useState("dashboard");
	// State to track which server has been selected for configuration
	const [selectedServer, setSelectedServer] = React.useState(null);
	// State to hold the live data for all servers
	const [servers, setServers] = React.useState({});
	// Any API error (used to show a helpful message in the UI)
	const [apiError, setApiError] = React.useState(null);
	// State to show a loading spinner on the first load
	const [loading, setLoading] = React.useState(true);

	// This effect runs once to fetch data continuously
	React.useEffect(() => {
		// Build API base from environment variable if provided. In production
		// you should set REACT_APP_API_URL to your backend (e.g. https://api.example.com)
		const API_BASE = process.env.REACT_APP_API_URL || "";
		console.log("Using API base:", API_BASE);

		function joinUrl(base, path) {
			if (!base) return path;
			return base.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
		}

		const fetchData = async () => {
			try {
				// Fetch data from the backend API. When REACT_APP_API_URL is empty
				// this falls back to a relative request (good for local dev with a proxy).
				const url = joinUrl(API_BASE, "/api/status");
				const res = await fetch(url);
				if (!res.ok) {
					// Non-2xx response
					throw new Error(`HTTP ${res.status} ${res.statusText}`);
				}
				const data = await res.json();
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
		fetchData(); // Fetch immediately
		const interval = setInterval(fetchData, 5000); // And then every 5 seconds
		return () => clearInterval(interval); // Clean up the interval
	}, []);

	// Function to switch to the config page
	const navigateToConfig = (serverName) => {
		setSelectedServer(serverName);
		setPage("config");
	};

	// Function to return to the dashboard
	const navigateToDashboard = () => {
		setSelectedServer(null);
		setPage("dashboard");
	};

	// Get the specific data for the selected server
	const selectedServerData = servers[selectedServer] || null;

	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<Container sx={{ mt: 4, mb: 4 }}>
				<Typography variant="h3" align="center" gutterBottom>
					GodlyHeroes Server Dashboard
				</Typography>

				{/* Simple router to show the correct page */}
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
