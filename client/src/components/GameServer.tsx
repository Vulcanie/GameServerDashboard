import { Card, CardContent, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import ServerList from "./server-list";
import type { ServerT } from "@/lib/types";

type GameServer = {
	title: string;
	heroImg: string;
	ServerListStyle: string;
	ServerListFields: string[];
	Servers: ServerT[];
};
export default function GameServer({
	title,
	heroImg,
	ServerListStyle,
	ServerListFields,
	Servers,
}: GameServer) {
	return (
		<Card className="mx-auto w-screen max-w-2xl overflow-hidden pt-0 mb-10 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40">
			<div className="relative aspect-video w-full">
				<img
					src={heroImg}
					alt="Event cover"
					className="absolute inset-0 h-full w-full object-cover"
				/>

				<div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent via-70% to-card" />

				<div className="absolute bottom-0 left-6 z-10">
					<CardTitle className="text-3xl text-white">
						{title}
					</CardTitle>
				</div>
			</div>

			<CardContent>
				<div className="rounded-md bg-[#07090A] pb-2">
					<div className={ServerListStyle}>
						{ServerListFields.map((field) => (
							<h1>{field}</h1>
						))}
					</div>
					<Separator />
					{Servers.map((server, index) => (
						<ServerList
							key={index}
							containerStyle={ServerListStyle}
							serverName={server.serverName}
							fields={server.serverFields}
						/>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
