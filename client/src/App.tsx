import ArkServer from "./components/ArkServer";
import ValheimServer from "./components/ValheimServer";
import { filterByServerType, useLatestStatus } from "./lib/useLatestStatus";

function App() {
	const { data, loading, error } = useLatestStatus();

	filterByServerType(data, "ark");
	return (
		<div className="flex w-full justify-center">
			<div className="grid grid-cols-2 gap-10 w-fit items-start mt-10">
				<ArkServer data={data} />
				<ValheimServer data={data} />
			</div>
		</div>
	);
}

export default App;
