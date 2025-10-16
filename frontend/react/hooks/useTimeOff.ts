import React from "react";

type TimeOffMap = Record<string, number>;

export function useTimeOff(user: string) {
	const STORAGE_KEY = "timeOff:v1";
	const [timeOffMap, setTimeOffMap] = React.useState<TimeOffMap>(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return {} as TimeOffMap;
			const parsed = JSON.parse(raw) as unknown;
			return parsed && typeof parsed === "object"
				? (parsed as TimeOffMap)
				: ({} as TimeOffMap);
		} catch {
			return {} as TimeOffMap;
		}
	});

	const keyFor = React.useCallback((iso: string) => `${user}::${iso}`, [user]);

	const getTimeOffHours = React.useCallback(
		(iso: string): number => {
			return timeOffMap[keyFor(iso)] || 0;
		},
		[timeOffMap, keyFor],
	);

	const setTimeOffHours = React.useCallback(
		(iso: string, hours: number) => {
			setTimeOffMap((prev) => {
				const next = { ...prev } as TimeOffMap;
				const k = keyFor(iso);
				if (hours > 0) next[k] = Math.max(0, Math.min(8, hours));
				else delete next[k];
				return next;
			});
		},
		[keyFor],
	);

	React.useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(timeOffMap));
		} catch {}
	}, [timeOffMap]);

	return { getTimeOffHours, setTimeOffHours };
}
