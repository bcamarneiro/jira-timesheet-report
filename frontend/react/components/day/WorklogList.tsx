import type React from 'react';
import type { JiraWorklog } from '../../../../types/JiraWorklog';
import { WorklogItem } from './WorklogItem';

type Props = {
	worklogs: JiraWorklog[];
};

export const WorklogList: React.FC<Props> = ({ worklogs }) => {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: 4,
				fontSize: 12,
				lineHeight: 1.3,
			}}
		>
			{worklogs.map((wl) => (
				<WorklogItem key={wl.id} worklog={wl} />
			))}
		</div>
	);
};
