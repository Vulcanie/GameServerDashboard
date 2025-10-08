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
	// State to show a loading spinner on the first load
	const [loading, setLoading] = React.useState(true);

	// This effect runs once to fetch data continuously
	React.useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch data from the local backend API
				const res = await fetch("/api/status");
				const data = await res.json();
				setServers(data);
			} catch (err) {
				console.error("Error fetching data:", err);
				setServers({});
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
