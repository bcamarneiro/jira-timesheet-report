import { create } from 'zustand';

function getMonday(date: Date): string {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	d.setDate(diff);
	return d.toISOString().slice(0, 10);
}

function getSunday(monday: string): string {
	const d = new Date(monday);
	d.setDate(d.getDate() + 6);
	return d.toISOString().slice(0, 10);
}

function shiftWeek(monday: string, weeks: number): string {
	const d = new Date(monday);
	d.setDate(d.getDate() + weeks * 7);
	return d.toISOString().slice(0, 10);
}

const todayMonday = getMonday(new Date());

interface TeamState {
	weekStart: string;
	weekEnd: string;

	setWeek: (start: string) => void;
	goToPrevWeek: () => void;
	goToNextWeek: () => void;
	goToCurrentWeek: () => void;
}

export const useTeamStore = create<TeamState>((set, get) => ({
	weekStart: todayMonday,
	weekEnd: getSunday(todayMonday),

	setWeek: (start) => set({ weekStart: start, weekEnd: getSunday(start) }),

	goToPrevWeek: () => {
		const prev = shiftWeek(get().weekStart, -1);
		set({ weekStart: prev, weekEnd: getSunday(prev) });
	},

	goToNextWeek: () => {
		const next = shiftWeek(get().weekStart, 1);
		set({ weekStart: next, weekEnd: getSunday(next) });
	},

	goToCurrentWeek: () => {
		const monday = getMonday(new Date());
		set({ weekStart: monday, weekEnd: getSunday(monday) });
	},
}));
