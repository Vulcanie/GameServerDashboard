import type { ServerField } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import CopyButton from "./ui/copy-btn";
import StatusDot from "./ui/status-dot";

type ServerList = {
	containerStyle: string;
	serverName: string;
	serverPing: number | undefined;
	fields: ServerField[];
};

export default function ServerList({
	containerStyle,
	serverName,
	serverPing,
	fields,
}: ServerList) {
	return (
		<div className={cn(containerStyle, "hover:bg-popover")}>
			<div className="h-max aspect-square flex items-center justify-center">
				<StatusDot status={serverPing ? "online" : "offline"} />
			</div>
			{fields.map((field, index) => {
				if (!field.isCopyable) {
					return <div key={index}>{field.field}</div>;
				} else {
					return (
						<CopyButton text={field.field}>
							{field.field}
						</CopyButton>
					);
				}
			})}
		</div>
	);
}
