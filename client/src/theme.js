import { createTheme, responsiveFontSizes } from "@mui/material";

// This file contains the Material-UI theme definition for the app.
// responsiveFontSizes() scales every Typography variant (h1-h6, body, etc.)
// down on narrow screens automatically, from this one place, instead of
// hand-tuning fontSize on every heading across the app.
export const darkTheme = responsiveFontSizes(
	createTheme({
		palette: {
			mode: "dark",
			background: {
				default: "#121212",
				paper: "#1e1e1e",
			},
		},
	}),
);
