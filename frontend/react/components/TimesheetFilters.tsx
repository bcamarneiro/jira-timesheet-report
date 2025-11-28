import type React from 'react';
import { useMemo } from 'react';
import { useTimesheetStore } from '../../stores/useTimesheetStore';
import { useUIStore } from '../../stores/useUIStore';
import * as styles from './TimesheetFilters.module.css';

export const TimesheetFilters: React.FC = () => {
	const data = useTimesheetStore((state) => state.data);
	const hideWeekends = useUIStore((state) => state.preferences.hideWeekends);
	const selectedProject = useUIStore((state) => state.selectedProject);
	const updatePreferences = useUIStore((state) => state.updatePreferences);
	const setSelectedProject = useUIStore((state) => state.setSelectedProject);

	// Extract unique projects from worklogs
	const projects = useMemo(() => {
		if (!data) return [];
		const projectSet = new Set<string>();
		for (const worklog of data) {
			const projectName = worklog.issue?.fields?.project?.name;
			if (projectName) {
				projectSet.add(projectName);
			}
		}
		return Array.from(projectSet).sort();
	}, [data]);

	const handleToggleWeekends = () => {
		updatePreferences({ hideWeekends: !hideWeekends });
	};

	return (
		<div className={styles.container}>
			<div className={styles.filter}>
				<label className={styles.checkboxLabel}>
					<input
						type="checkbox"
						checked={hideWeekends}
						onChange={handleToggleWeekends}
						className={styles.checkbox}
					/>
					Hide Weekends
				</label>
			</div>

			{projects.length > 0 && (
				<div className={styles.filter}>
					<label htmlFor="project-filter" className={styles.label}>
						Project:
					</label>
					<select
						id="project-filter"
						value={selectedProject}
						onChange={(e) => setSelectedProject(e.target.value)}
						className={styles.select}
					>
						<option value="">All Projects ({projects.length})</option>
						{projects.map((project) => (
							<option key={project} value={project}>
								{project}
							</option>
						))}
					</select>
				</div>
			)}
		</div>
	);
};
