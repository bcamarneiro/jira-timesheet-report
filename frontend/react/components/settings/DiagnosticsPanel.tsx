import type React from 'react';
import { SETTINGS_SECTION_IDS } from '../../constants/settingsSections';
import { Button } from '../ui/Button';
import type {
	SettingsSetupModel,
	SetupStatus,
	SurfaceReadinessModel,
} from '../../utils/settingsSetup';
import * as styles from './DiagnosticsPanel.module.css';

type Props = {
	model: SettingsSetupModel;
	canRunChecks: boolean;
	checksRunning: boolean;
	onJumpToSection: (sectionId: string) => void;
	onRunAvailableChecks: () => Promise<void> | void;
};

const statusLabelMap: Record<SetupStatus, string> = {
	ready: 'Ready',
	warning: 'Needs review',
	pending: 'Pending',
};

const statusClassMap: Record<SetupStatus, string> = {
	ready: styles.statusReady,
	warning: styles.statusWarning,
	pending: styles.statusPending,
};

const surfaceActionMap: Record<SurfaceReadinessModel['label'], string> = {
	Dashboard: 'Review Dashboard readiness',
	Reports: 'Review Reports readiness',
};

export const DiagnosticsPanel: React.FC<Props> = ({
	model,
	canRunChecks,
	checksRunning,
	onJumpToSection,
	onRunAvailableChecks,
}) => {
	return (
		<section className={styles.panel} aria-labelledby="diagnostics-title">
			<div className={styles.header}>
				<div>
					<p className={styles.kicker}>Diagnostics</p>
					<h2 id="diagnostics-title">Readiness and trust signals</h2>
					<p className={styles.description}>
						These checks tell us whether Dashboard and Reports are ready to be
						trusted day to day, not just whether the fields are filled in.
					</p>
				</div>
				{canRunChecks ? (
					<Button
						type="button"
						variant="secondary"
						onClick={onRunAvailableChecks}
						disabled={checksRunning}
					>
						{checksRunning ? 'Running checks...' : 'Refresh diagnostics'}
					</Button>
				) : null}
			</div>

			<div className={styles.surfaceGrid}>
				{Object.values(model.surfaces).map((surface) => (
					<article key={surface.label} className={styles.surfaceCard}>
						<div className={styles.surfaceHeader}>
							<h3>{surface.label}</h3>
							<span
								className={`${styles.statusBadge} ${statusClassMap[surface.status]}`}
							>
								{statusLabelMap[surface.status]}
							</span>
						</div>
						<p>{surface.detail}</p>
						<Button
							type="button"
							variant="secondary"
							onClick={() => {
								onJumpToSection(
									surface.label === 'Dashboard'
										? SETTINGS_SECTION_IDS.integrations
										: SETTINGS_SECTION_IDS.scope,
								);
							}}
						>
							{surfaceActionMap[surface.label]}
						</Button>
					</article>
				))}
			</div>

			<div className={styles.list}>
				{model.diagnostics.map((item) => (
					<div key={item.id} className={styles.row}>
						<div className={styles.rowHeader}>
							<div>
								<h3>{item.label}</h3>
								<p>{item.detail}</p>
							</div>
							<span
								className={`${styles.statusBadge} ${statusClassMap[item.status]}`}
							>
								{statusLabelMap[item.status]}
							</span>
						</div>
						<div className={styles.rowActions}>
							<Button
								type="button"
								variant="secondary"
								onClick={() => onJumpToSection(item.sectionId)}
							>
								Open section
							</Button>
							{item.id === 'jira' && canRunChecks ? (
								<Button
									type="button"
									variant="secondary"
									onClick={onRunAvailableChecks}
									disabled={checksRunning}
								>
									{checksRunning ? 'Running...' : 'Run checks'}
								</Button>
							) : null}
						</div>
					</div>
				))}
			</div>
		</section>
	);
};
