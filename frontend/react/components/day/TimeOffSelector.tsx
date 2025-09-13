import type React from "react";
import { TIME_OFF_OPTIONS } from "../../constants/timesheet";

type Props = {
	value: number;
	onChange: (hours: number) => void;
	isWeekend: boolean;
};

export const TimeOffSelector: React.FC<Props> = ({
	value,
	onChange,
	isWeekend,
}) => {
	if (isWeekend) return null;

	return (
		<select
			value={value}
			onChange={(e) => onChange(Number(e.target.value) || 0)}
			title="Time off (counts only for karma)"
			style={{
				fontSize: 11,
				padding: "2px 4px",
				borderRadius: 4,
				border: "1px solid #ccc",
				background: "#fff",
				color: "#333",
			}}
		>
			{TIME_OFF_OPTIONS.map((hours) => (
				<option key={hours} value={hours}>
					{hours === 0 ? "time off" : `${hours}h`}
				</option>
			))}
		</select>
	);
};

