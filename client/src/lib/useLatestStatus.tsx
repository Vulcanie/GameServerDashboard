import { useState, useEffect } from "react";

import type { GameServer, ServersResponse } from "./types";

export function useLatestStatus() {
	const [data, setData] = useState<ServersResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchStatus() {
			console.log("fetching data");
			try {
				console.log(import.meta.env.VITE_API_URL);
				const url = new URL(
					"/api/status/latest",
					import.meta.env.VITE_API_URL,
				);
				const res = await fetch(url);

				if (!res.ok) {
					throw new Error("Failed to fetch");
				}

				const json = await res.json();
				console.log(json);
				setData(json);
			} catch (err) {
				if (err instanceof Error) {
					setError(err.message);
				}
				console.log(err);
			} finally {
				setLoading(false);
			}
		}

		fetchStatus();
	}, []);

	return { data, loading, error };
}

type WithServerName<T> = T & { serverName: string };

export function filterByServerType<T extends GameServer["type"]>(
	servers: ServersResponse | null,
	type: T,
): WithServerName<Extract<GameServer, { type: T }>>[] {
	if (!servers) {
		return [];
	}

	const filtered = Object.entries(servers).filter(
		(entry): entry is [string, Extract<GameServer, { type: T }>] =>
			entry[1].type === type,
	);

	return filtered.map(([serverName, server]) => ({
		...server,
		serverName,
	}));
}
