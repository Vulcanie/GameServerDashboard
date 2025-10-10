import React, { useState } from "react";
import { Button, TextField, Typography, Box } from "@mui/material";

// 👇 Manually set usernames and passwords here
const USERS = {
	admin: "!Admin4HonorAdmin!",
	guest: "GodlyGuest",
};

export default function LoginPage({ onLogin }) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleLogin = () => {
		if (USERS[username] && USERS[username] === password) {
			onLogin(username); // Pass role to App.js
		} else {
			setError("Invalid username or password");
		}
	};

	return (
		<Box sx={{ mt: 8, textAlign: "center" }}>
			<Typography variant="h4" gutterBottom>
				Server Dashboard Login
			</Typography>
			<TextField
				label="Username"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				margin="normal"
			/>
			<br />
			<TextField
				label="Password"
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				margin="normal"
			/>
			<br />
			<Button variant="contained" onClick={handleLogin} sx={{ mt: 2 }}>
				Login
			</Button>
			{error && (
				<Typography color="error" sx={{ mt: 2 }}>
					{error}
				</Typography>
			)}
		</Box>
	);
}
