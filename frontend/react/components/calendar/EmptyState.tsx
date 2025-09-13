import type React from "react";

type Props = {
	hasData: boolean;
};

export const EmptyState: React.FC<Props> = ({ hasData }) => {
	if (hasData) return null;

	return (
		<div
			style={{
				position: "absolute",
				inset: 0,
				zIndex: 10,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "rgba(210, 210, 210, 0.9)",
				color: "#222",
				fontWeight: "bold",
				fontSize: 22,
				textAlign: "center",
			}}
		>
			não tens dados, maninho!
		</div>
	);
};

