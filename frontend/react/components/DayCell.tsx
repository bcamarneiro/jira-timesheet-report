import type React from 'react';
import { useState } from 'react';

import type { JiraWorklog } from '../../../types/JiraWorklog';
import type { EnrichedJiraWorklog } from '../../stores/useTimesheetStore';
import { useDayCalculation } from '../hooks/useDayCalculation';
import { useWorklogOperations } from '../hooks/useWorklogOperations';
import * as styles from './DayCell.module.css';
import { DaySummary } from './day/DaySummary';
import { TimeOffSelector } from './day/TimeOffSelector';
import { WorklogList } from './day/WorklogList';
import { Modal } from './ui/Modal';
import { WorklogForm } from './worklog/WorklogForm';

type Props = {
	iso: string;
	dayNumber: number;
	user: string;
	worklogs: JiraWorklog[];
	isWeekend: boolean;
	timeOffHours: number;
	onTimeOffChange: (hours: number) => void;
};

export const DayCell: React.FC<Props> = ({
	iso,
	dayNumber,
	user,
	worklogs,
	isWeekend,
	timeOffHours,
	onTimeOffChange,
}) => {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [worklogToEdit, setWorklogToEdit] = useState<EnrichedJiraWorklog | null>(
		null,
	);

	const { createWorklog, updateWorklog, deleteWorklog, isLoading } =
		useWorklogOperations();

	const { dayTotalSeconds, effectiveSeconds, missingSeconds } =
		useDayCalculation(worklogs, isWeekend, timeOffHours);

	// Determine CSS class based on day type and work status
	const getDayClass = () => {
		if (isWeekend) {
			return dayTotalSeconds > 0 ? styles.weekend : styles.weekendEmpty;
		} else {
			if (effectiveSeconds === 8 * 3600) return styles.weekdayComplete;
			else if (effectiveSeconds < 8 * 3600) return styles.weekdayIncomplete;
			else return styles.weekdayOvertime;
		}
	};

	const handleCreateWorklog = async (data: {
		issueKey: string;
		timeSpent: string;
		comment: string;
		started: string;
	}) => {
		await createWorklog(data);
		setIsCreateModalOpen(false);
	};

	const handleEditWorklog = (worklog: EnrichedJiraWorklog) => {
		setWorklogToEdit(worklog);
		setIsEditModalOpen(true);
	};

	const handleUpdateWorklog = async (data: {
		issueKey: string;
		timeSpent: string;
		comment: string;
		started: string;
	}) => {
		if (!worklogToEdit || !worklogToEdit.id || !worklogToEdit.issue?.key) return;

		await updateWorklog(worklogToEdit.issue.key, worklogToEdit.id, {
			timeSpent: data.timeSpent,
			comment: data.comment,
			started: data.started,
		});

		setIsEditModalOpen(false);
		setWorklogToEdit(null);
	};

	const handleDeleteWorklog = async (worklog: EnrichedJiraWorklog) => {
		if (!worklog.id || !worklog.issue?.key) return;

		if (
			window.confirm(
				`Are you sure you want to delete this worklog for ${worklog.issue.key}?`,
			)
		) {
			await deleteWorklog(worklog.issue.key, worklog.id);
		}
	};

	// Convert ISO date to datetime-local format
	const isoToDateTimeLocal = (isoDate: string) => {
		const date = new Date(isoDate);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	};

	// Default started time for new worklogs (current day at 9:00 AM)
	const defaultStarted = `${iso}T09:00`;

	return (
		<>
			<div key={iso} className={`${styles.dayCell} ${getDayClass()}`}>
				<div className={styles.header}>
					<div className={styles.dayNumber}>{String(dayNumber)}</div>
					<div className={styles.logsContainer}>
						{worklogs.length > 0 && (
							<div className={styles.logInfo}>
								{worklogs.length} {worklogs.length === 1 ? 'log' : 'logs'}
							</div>
						)}
						<button
							type="button"
							onClick={() => setIsCreateModalOpen(true)}
							className={styles.addButton}
							title="Add worklog"
						>
							+
						</button>
						<TimeOffSelector
							value={timeOffHours}
							onChange={onTimeOffChange}
							isWeekend={isWeekend}
						/>
					</div>
				</div>
				<WorklogList
					worklogs={worklogs}
					onEdit={handleEditWorklog}
					onDelete={handleDeleteWorklog}
				/>
				<DaySummary
					dayTotalSeconds={dayTotalSeconds}
					timeOffHours={timeOffHours}
					missingSeconds={missingSeconds}
					isWeekend={isWeekend}
				/>
			</div>

			<Modal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				title="Create Worklog"
			>
				<WorklogForm
					initialData={{ issueKey: '', timeSpent: '', comment: '', started: defaultStarted }}
					onSubmit={handleCreateWorklog}
					onCancel={() => setIsCreateModalOpen(false)}
					isLoading={isLoading}
				/>
			</Modal>

			<Modal
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false);
					setWorklogToEdit(null);
				}}
				title="Edit Worklog"
			>
				{worklogToEdit && (
					<WorklogForm
						initialData={{
							issueKey: worklogToEdit.issue?.key || '',
							timeSpent: worklogToEdit.timeSpent || '',
							comment:
								typeof worklogToEdit.comment === 'string'
									? worklogToEdit.comment
									: '',
							started: worklogToEdit.started
								? isoToDateTimeLocal(worklogToEdit.started)
								: defaultStarted,
						}}
						onSubmit={handleUpdateWorklog}
						onCancel={() => {
							setIsEditModalOpen(false);
							setWorklogToEdit(null);
						}}
						isEdit
						isLoading={isLoading}
					/>
				)}
			</Modal>
		</>
	);
};
