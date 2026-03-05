import { statusStyles } from "@/lib/serverConstants";
import type { ServerStatus } from "@/lib/types";

export default function StatusDot({ status }: { status: ServerStatus }) {
	const config = statusStyles[status];

	console.log(config);
	return (
		<span className="relative flex h-3 w-3">
			{status === "online" && (
				<span
					className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${config.dotClass}`}
				/>
			)}
			<span
				className={`relative inline-flex h-3 w-3 rounded-full ${config.dotClass}`}
			/>
		</span>
	);
}
