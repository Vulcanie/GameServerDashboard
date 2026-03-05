import { useEffect, useState } from "react";
import { useLatestStatus } from "./hooks/useLatestStatus";
import Servers from "./Servers";
import { Spinner } from "./components/ui/spinner";
import { Toaster } from "./components/ui/sonner";
import { Switch } from "./components/ui/switch";
import { Label } from "./components/ui/label";

function App() {
	const [hideOffline, setHideOffline] = useState(false);

	const { data, loading, error } = useLatestStatus();

	useEffect(() => {}, [loading]);

	if (loading) {
		return (
			<div className="flex flex-row items-center">
				<Spinner className="w-10 h-10 " />
				<h1 className="text-4xl ml-5">Fetching data from servers</h1>
			</div>
		);
	} else if (data) {
		return (
			<>
				<div className="flex flex-row justify-between">
					<h1 className="leading-tighter w-fit text-3xl font-semibold tracking-tight text-balance text-primary lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter max-w-4xl mt-10">
						GodlyHeroes Server Dashboard
					</h1>
					<div className="flex items-end justify-center gap-3">
						<Switch
							checked={hideOffline}
							onCheckedChange={setHideOffline}
							id="hide-offline"
						/>

						<Label htmlFor="hide-offline">
							{hideOffline ? "Hide Offline" : "Show Offline"}
						</Label>
					</div>
				</div>
				<div className="columns-1 xl:columns-2 gap-10 w-fit my-10">
					<Servers hideOffline={hideOffline} response={data} />
				</div>
				<Toaster />
			</>
		);
	} else {
		return <h1>Error data from servers</h1>;
	}
}

export default App;
