type ServerList = {
	containerStyle: string;
	serverName: string;
	fields: string[];
};

export default function ServerList({
	containerStyle,
	serverName,
	fields,
}: ServerList) {
	return (
		<div className={containerStyle}>
			{fields.map((field, index) => (
				<div key={index}>{field}</div>
			))}
		</div>
	);
}
