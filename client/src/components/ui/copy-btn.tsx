import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import CopyIcon from "../icon/copy";

export default function CopyButton({
	children,
	text,
}: {
	children: ReactNode | ReactNode[];
	text: string;
}) {
	const [copied, setCopied] = useState(false);
	const [hovered, setHovered] = useState(false);

	async function handleCopy() {
		if (copied) return;
		toast(`copied ${text} to clipboard`, {
			position: "top-center",
		});

		await navigator.clipboard.writeText(text);
		setCopied(true);

		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<button
			className="text-left hover:bg-secondary w-min pr-2 hover:pl-2 rounded-sm flex flex-row"
			onClick={handleCopy}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
		>
			{children}
            {hovered ? <CopyIcon /> : <></>}
            
		</button>
	);
}
