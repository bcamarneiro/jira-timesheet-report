import type React from "react";
import { formatHours } from "../../utils/format";

type Props = {
	dayTotalSeconds: number;
	timeOffHours: number;
	missingSeconds: number;
	isWeekend: boolean;
};

export const DaySummary: React.FC<Props> = ({
	dayTotalSeconds,
	timeOffHours,
	missingSeconds,
	isWeekend,
}) => {
	return (
		<div
			style={{
				marginTop: "auto",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				fontSize: 12,
				fontWeight: 600,
			}}
		>
			<div style={{ color: "#333" }}>Total: {formatHours(dayTotalSeconds)}</div>
			<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
				{!isWeekend && timeOffHours > 0 && (
					<span title="Time off (counts for karma)">TO: {timeOffHours}h</span>
				)}
				{missingSeconds > 0 && (
					<div style={{ color: "#a14" }}>
						{formatHours(missingSeconds)} missing
					</div>
				)}
			</div>
		</div>
	);
};

