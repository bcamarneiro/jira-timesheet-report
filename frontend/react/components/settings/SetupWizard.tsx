import type React from 'react';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import type {
	SettingsSetupModel,
	SetupStatus,
	SetupStepModel,
} from '../../utils/settingsSetup';
import * as styles from './SetupWizard.module.css';

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

function getActionLabel(step: SetupStepModel, canRunChecks: boolean): string {
	if (step.id === 'verify') {
		return canRunChecks ? 'Run checks' : 'Review form';
	}

	if (step.id === 'connection') return 'Open connection';
	if (step.id === 'scope') return 'Review scope';
	return 'Open integrations';
}

export const SetupWizard: React.FC<Props> = ({
	model,
	canRunChecks,
	checksRunning,
	onJumpToSection,
	onRunAvailableChecks,
}) => {
	return (
		<section className={styles.panel} aria-labelledby="setup-wizard-title">
			<div className={styles.header}>
				<div className={styles.headerText}>
					<p className={styles.kicker}>First-run setup</p>
					<h2 id="setup-wizard-title">Setup wizard</h2>
					<p>{model.headline}</p>
				</div>
				{canRunChecks ? (
					<Button
						type="button"
						variant="secondary"
						onClick={onRunAvailableChecks}
						disabled={checksRunning}
					>
						{checksRunning ? 'Running checks...' : 'Run available checks'}
					</Button>
				) : null}
			</div>

			<div className={styles.progressCard}>
				<div className={styles.progressHeader}>
					<div>
						<strong>
							{model.progress.completed} of {model.progress.total} setup steps
							complete
						</strong>
						<p>{model.detail}</p>
					</div>
					<span
						className={`${styles.statusBadge} ${statusClassMap[model.status]}`}
					>
						{statusLabelMap[model.status]}
					</span>
				</div>
				<ProgressBar value={model.progress.percent} height={8} />
				<div className={styles.quickFacts}>
					<span>{model.quickFacts.allowedUsersCount} allowed users</span>
					<span>{model.quickFacts.configuredSignalCount} optional signals</span>
					<span>{model.quickFacts.suggestionFeedCount} suggestion feeds</span>
					<span>{model.quickFacts.absenceFeedCount} absence feeds</span>
				</div>
			</div>

			<div className={styles.stepsGrid}>
				{model.steps.map((step, index) => (
					<article key={step.id} className={styles.stepCard}>
						<div className={styles.stepHeader}>
							<div className={styles.stepHeading}>
								<span className={styles.stepNumber}>{index + 1}</span>
								<div>
									<div className={styles.stepTitleRow}>
										<h3>{step.title}</h3>
										{step.optional ? (
											<span className={styles.optionalBadge}>Optional</span>
										) : null}
									</div>
									<p>{step.summary}</p>
								</div>
							</div>
							<span
								className={`${styles.statusBadge} ${statusClassMap[step.status]}`}
							>
								{statusLabelMap[step.status]}
							</span>
						</div>
						<p className={styles.stepDetail}>{step.detail}</p>
						<Button
							type="button"
							variant="secondary"
							onClick={() => {
								if (step.id === 'verify' && canRunChecks) {
									void onRunAvailableChecks();
									return;
								}

								onJumpToSection(step.sectionId);
							}}
							disabled={step.id === 'verify' && checksRunning}
						>
							{step.id === 'verify' && checksRunning
								? 'Running checks...'
								: getActionLabel(step, canRunChecks)}
						</Button>
					</article>
				))}
			</div>
		</section>
	);
};
