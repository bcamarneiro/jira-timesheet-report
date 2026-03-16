import { create } from 'zustand';
import type { TeamMemberSummary } from '../services/teamService';

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
	teamMembers: TeamMemberSummary[];
	isLoading: boolean;
	error: string | null;

	setWeek: (start: string) => void;
	goToPrevWeek: () => void;
	goToNextWeek: () => void;
	goToCurrentWeek: () => void;
	setTeamMembers: (members: TeamMemberSummary[]) => void;
	setLoading: (value: boolean) => void;
	setError: (value: string | null) => void;
}

export const useTeamStore = create<TeamState>((set, get) => ({
	weekStart: todayMonday,
	weekEnd: getSunday(todayMonday),
	teamMembers: [],
	isLoading: false,
	error: null,

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

	setTeamMembers: (members) => set({ teamMembers: members }),
	setLoading: (value) => set({ isLoading: value }),
	setError: (value) => set({ error: value }),
}));
