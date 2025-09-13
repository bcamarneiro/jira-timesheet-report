import type React from "react";
import { Button } from "./ui/Button";

type Props = {
	label: string;
	onPrev: () => void;
	onNext: () => void;
};

export const MonthNavigator: React.FC<Props> = ({ label, onPrev, onNext }) => {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: "0.5em",
				marginBottom: "1em",
			}}
		>
			<Button onClick={onPrev} variant="secondary">
				{"←"}
			</Button>
			<div style={{ fontWeight: "bold" }}>{label}</div>
			<Button onClick={onNext} variant="secondary">
				{"→"}
			</Button>
		</div>
	);
};
