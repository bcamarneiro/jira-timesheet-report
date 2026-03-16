import type React from 'react';
import type { TeamMemberSummary } from '../../../services/teamService';
import { formatHours } from '../../utils/format';
import { StatCard } from '../ui/StatCard';
import * as styles from './TeamStatsCards.module.css';

type Props = {
	teamMembers: TeamMemberSummary[];
};

export const TeamStatsCards: React.FC<Props> = ({ teamMembers }) => {
	const count = teamMembers.length;
	if (count === 0) return null;

	const totalSeconds = teamMembers.reduce((s, m) => s + m.totalSeconds, 0);
	const compliant = teamMembers.filter((m) => m.gapSeconds === 0).length;
	const complianceRate = Math.round((compliant / count) * 100);
	const avgSeconds = Math.round(totalSeconds / count);

	const complianceColor =
		complianceRate === 100
			? 'var(--color-success)'
			: complianceRate >= 50
				? 'var(--color-warning)'
				: 'var(--color-error)';

	return (
		<div className={styles.grid}>
			<StatCard label="Total Hours" value={formatHours(totalSeconds)} />
			<StatCard
				label="Compliance"
				value={`${complianceRate}%`}
				valueColor={complianceColor}
			/>
			<StatCard label="Team Size" value={count} />
			<StatCard label="Avg / Member" value={formatHours(avgSeconds)} />
		</div>
	);
};
