export type WorklogFetchPhase =
	| 'searching'
	| 'inspecting'
	| 'fetching-truncated'
	| 'complete';

export interface WorklogFetchProgress {
	phase: WorklogFetchPhase;
	percent: number;
	message: string;
	detail?: string;
}
