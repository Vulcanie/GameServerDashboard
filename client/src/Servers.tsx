import GameServer from "./components/GameServer";
import {
	ConvertArkServers,
	convertEnshroudedServers,
	convertMinecraftServers,
	ConvertValheimServers,
} from "./lib/convertServers";
import type { ServersResponse } from "./lib/types";
import { filterByServerType } from "./hooks/useLatestStatus";

import minecraftHeroURL from "@/assets/Minecraft_HERO.jpg";
import valheimHeroURL from "@/assets/Valheim_HERO.jpg";
import arkHeroURL from "@/assets/ARKSurvivalAscended_HERO.jpg";
import enshroudedHeroURL from "@/assets/Enshrouded_HERO.jpg";

import {
	ArkServerFields,
	ArkServerListStyle,
	EnshroudedServerFields,
	EnshroudedServerListStyle,
	MinecraftServerFields,
	MinecraftServerListStyle,
	ValheimServerFields,
	ValheimServerListStyle,
} from "./lib/serverConstants";

export default function Servers({ response, hideOffline }: { response: ServersResponse, hideOffline: boolean }) {
	const arkServers = filterByServerType(response, "ark");
	const valheimServers = filterByServerType(response, "valheim");
	const minecraftServers = filterByServerType(response, "minecraft");
	const enshroudedServers = filterByServerType(response, "enshrouded");

	return (
		<>
			<GameServer
				title="ARK Survival Ascended"
				heroImg={arkHeroURL}
				ServerListFields={ArkServerFields}
				ServerListStyle={ArkServerListStyle}
				Servers={ConvertArkServers(arkServers)}
                hideOffline={hideOffline}
			/>
			<GameServer
				title="Minecraft"
				heroImg={minecraftHeroURL}
				ServerListFields={MinecraftServerFields}
				ServerListStyle={MinecraftServerListStyle}
				Servers={convertMinecraftServers(minecraftServers)}
                hideOffline={hideOffline}
			/>
			<GameServer
				title="Valheim"
				heroImg={valheimHeroURL}
				ServerListFields={ValheimServerFields}
				ServerListStyle={ValheimServerListStyle}
				Servers={ConvertValheimServers(valheimServers)}
                hideOffline={hideOffline}
			/>
			<GameServer
				title="Enshrouded"
				heroImg={enshroudedHeroURL}
				ServerListFields={EnshroudedServerFields}
				ServerListStyle={EnshroudedServerListStyle}
				Servers={convertEnshroudedServers(enshroudedServers)}
                hideOffline={hideOffline}
			/>
		</>
	);
}
