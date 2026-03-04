import valheimHeroURL from "@/assets/Valheim_HERO.jpg";
import { Card, CardContent, CardTitle } from "./ui/card";
import { filterByServerType } from "@/lib/useLatestStatus";
import { Separator } from "./ui/separator";
import type { ServersResponse } from "@/lib/types";

export default function ValheimServer({ data }: { data: ServersResponse | null }) {
	return (
		<Card className="mx-auto w-screen max-w-2xl overflow-hidden pt-0">
			<div className="relative aspect-video w-full">
				<img
					src={valheimHeroURL}
					alt="Event cover"
					className="absolute inset-0 h-full w-full object-cover"
				/>

				<div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent via-70% to-card" />

				<div className="absolute bottom-4 left-6 z-10">
					<CardTitle className="text-2xl text-white">
						Valheim
					</CardTitle>
				</div>
			</div>

			<CardContent>
				<div className="rounded-md bg-[#07090A] pb-2">
					<div className="grid grid-cols-[150px_150px_80px_1fr] gap-4 px-2">
						<h1>Name</h1>
						<h1>Session</h1>
						<h1>Players</h1>
						<h1>Password</h1>
					</div>
					<Separator />
					{filterByServerType(data, "valheim").map((server, index) => (
						<div className="grid grid-cols-[150px_150px_80px_1fr] gap-4 px-2">
							<h1>{server.serverName}</h1>
							<h1>{server.sessionName}</h1>
							<h1>{server.playerCount}</h1>
							<h1>{server.serverPassword}</h1>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
