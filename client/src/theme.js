import { createTheme } from "@mui/material";

// This file contains the Material-UI theme definition for the app.
export const darkTheme = createTheme({
	palette: {
		mode: "dark",
		background: {
			default: "#121212",
			paper: "#1e1e1e",
		},
	},
});
