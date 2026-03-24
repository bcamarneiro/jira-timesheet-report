import type React from 'react';
import type { EnrichedJiraWorklog } from '../../../../types/jira';
import { WorklogItem } from './WorklogItem';
import * as styles from './WorklogList.module.css';

type Props = {
	worklogs: EnrichedJiraWorklog[];
	issueSummaries: Record<string, string>;
	onEdit?: (worklog: EnrichedJiraWorklog) => void;
	onDelete?: (worklog: EnrichedJiraWorklog) => void;
};

export const WorklogList: React.FC<Props> = ({
	worklogs,
	issueSummaries,
	onEdit,
	onDelete,
}) => {
	return (
		<div className={styles.list}>
			{worklogs.map((wl) => (
				<WorklogItem
					key={wl.id}
					worklog={wl}
					issueSummaries={issueSummaries}
					onEdit={onEdit}
					onDelete={onDelete}
				/>
			))}
		</div>
	);
};
