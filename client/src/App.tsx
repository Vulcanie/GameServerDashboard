import { useEffect } from "react";
import { useLatestStatus } from "./lib/useLatestStatus";
import Servers from "./Servers";

function App() {
	const { data, loading, error } = useLatestStatus();

	useEffect(() => {}, [loading]);

	if (loading) {
		return <h1>Fetching data fron servers</h1>;
	} else if (data) {
		return (
			<div>
				<div className="columns-1 xl:columns-2 gap-10 w-fit my-10">
					<Servers response={data} />
				</div>
			</div>
		);
	} else {
		return <h1>Error data fron servers</h1>;
	}
}

export default App;
