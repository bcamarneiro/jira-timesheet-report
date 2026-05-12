import type React from 'react';

type Props = {
	totalSeconds: number;
	/** When undefined, renders only the total — used in summary contexts. */
	targetSeconds?: number;
	className?: string;
};

/**
 * Canonical "Xh / Yh (Z%)" rendering used by TimesheetGrid and UserHeader.
 * Total uses 1dp; target is rounded to integer hours (Wave 2 convention).
 */
export const HoursProgressLine: React.FC<Props> = ({
	totalSeconds,
	targetSeconds,
	className,
}) => {
	const totalHours = totalSeconds / 3600;
	if (targetSeconds === undefined) {
		return <span className={className}>{totalHours.toFixed(1)}h</span>;
	}
	const targetHours = targetSeconds / 3600;
	const pct = targetSeconds > 0 ? (totalSeconds / targetSeconds) * 100 : 0;
	return (
		<span className={className}>
			{totalHours.toFixed(1)}h / {Math.round(targetHours)}h ({Math.round(pct)}%)
		</span>
	);
};
