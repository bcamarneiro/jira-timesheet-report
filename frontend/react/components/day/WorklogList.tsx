import type React from 'react';
import type { EnrichedJiraWorklog } from '../../../stores/useTimesheetStore';
import { WorklogItem } from './WorklogItem';
import * as styles from './WorklogList.module.css';

type Props = {
	worklogs: EnrichedJiraWorklog[];
	onEdit?: (worklog: EnrichedJiraWorklog) => void;
	onDelete?: (worklog: EnrichedJiraWorklog) => void;
};

export const WorklogList: React.FC<Props> = ({
	worklogs,
	onEdit,
	onDelete,
}) => {
	return (
		<div className={styles.list}>
			{worklogs.map((wl) => (
				<WorklogItem
					key={wl.id}
					worklog={wl}
					onEdit={onEdit}
					onDelete={onDelete}
				/>
			))}
		</div>
	);
};
