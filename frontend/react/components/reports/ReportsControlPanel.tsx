import type React from 'react';
import { useState } from 'react';
import type { ReportPreset } from '../../../stores/useUserDataStore';
import type {
	ReportsSortDirection,
	ReportsSortField,
	ReportsViewMode,
} from '../../hooks/useReportsURLState';
import { Button } from '../ui/Button';
import * as styles from './ReportsControlPanel.module.css';

type ValidationState = {
	status: 'idle' | 'checking' | 'consistent' | 'inconsistent' | 'error';
	message: string;
	checkedAt: string | null;
	mismatches: Array<{
		displayName: string;
		weeklySeconds: number;
		monthlySeconds: number;
	}>;
};

type Props = {
	viewMode: ReportsViewMode;
	searchQuery: string;
	onlyAttentionNeeded: boolean;
	managerMode: boolean;
	trendWeeks: number;
	sortField: ReportsSortField;
	sortDirection: ReportsSortDirection;
	presets: ReportPreset[];
	onSearchChange: (value: string) => void;
	onOnlyAttentionNeededChange: (value: boolean) => void;
	onManagerModeChange: (value: boolean) => void;
	onTrendWeeksChange: (value: number) => void;
	onClearFilters: () => void;
	onSavePreset: (label: string) => void;
	onApplyPreset: (preset: ReportPreset) => void;
	onRemovePreset: (id: string) => void;
	onCopyShareLink: () => Promise<void> | void;
	onExportSnapshotHtml: () => void;
	onExportSnapshotMarkdown: () => void;
	onValidateConsistency: () => Promise<void> | void;
	validationState: ValidationState;
	canValidate: boolean;
	canExportSnapshot: boolean;
};

const validationToneMap = {
	idle: styles.validationIdle,
	checking: styles.validationChecking,
	consistent: styles.validationConsistent,
	inconsistent: styles.validationInconsistent,
	error: styles.validationError,
} as const;

export const ReportsControlPanel: React.FC<Props> = ({
	viewMode,
	searchQuery,
	onlyAttentionNeeded,
	managerMode,
	trendWeeks,
	sortField,
	sortDirection,
	presets,
	onSearchChange,
	onOnlyAttentionNeededChange,
	onManagerModeChange,
	onTrendWeeksChange,
	onClearFilters,
	onSavePreset,
	onApplyPreset,
	onRemovePreset,
	onCopyShareLink,
	onExportSnapshotHtml,
	onExportSnapshotMarkdown,
	onValidateConsistency,
	validationState,
	canValidate,
	canExportSnapshot,
}) => {
	const [presetName, setPresetName] = useState('');

	return (
		<section className={styles.panel} aria-labelledby="reports-controls-title">
			<div className={styles.header}>
				<div>
					<p className={styles.kicker}>Reports controls</p>
					<h2 id="reports-controls-title">
						Filter, share, and validate this view
					</h2>
					<p className={styles.description}>
						Search is always local to the current reports surface. Share links
						preserve the current state, and presets let you reuse the same
						filters without rebuilding them every time.
					</p>
				</div>
				<div className={styles.headerActions}>
					<Button
						type="button"
						variant="secondary"
						onClick={() => {
							void onCopyShareLink();
						}}
					>
						Copy share link
					</Button>
					<Button
						type="button"
						variant="secondary"
						onClick={onExportSnapshotHtml}
						disabled={!canExportSnapshot}
					>
						Snapshot HTML
					</Button>
					<Button
						type="button"
						variant="secondary"
						onClick={onExportSnapshotMarkdown}
						disabled={!canExportSnapshot}
					>
						Snapshot MD
					</Button>
					<Button
						type="button"
						variant="secondary"
						onClick={() => {
							void onValidateConsistency();
						}}
						disabled={!canValidate || validationState.status === 'checking'}
					>
						{validationState.status === 'checking'
							? 'Validating...'
							: 'Validate weekly vs monthly'}
					</Button>
				</div>
			</div>

			<div className={styles.filtersRow}>
				<label className={styles.searchField}>
					<span>Filter people</span>
					<input
						type="search"
						value={searchQuery}
						onChange={(event) => onSearchChange(event.target.value)}
						placeholder={
							viewMode === 'weekly'
								? 'Search by team member or email'
								: 'Search monthly users'
						}
					/>
				</label>
				{viewMode === 'weekly' ? (
					<div className={styles.weeklyToggles}>
						<label className={styles.checkboxLabel}>
							<input
								type="checkbox"
								checked={onlyAttentionNeeded}
								onChange={(event) =>
									onOnlyAttentionNeededChange(event.target.checked)
								}
							/>
							<span>Attention only</span>
						</label>
						<label className={styles.checkboxLabel}>
							<input
								type="checkbox"
								checked={managerMode}
								onChange={(event) => onManagerModeChange(event.target.checked)}
							/>
							<span>Manager mode</span>
						</label>
						{managerMode ? (
							<label className={styles.trendField}>
								<span>Trend window</span>
								<select
									value={trendWeeks}
									onChange={(event) =>
										onTrendWeeksChange(Number.parseInt(event.target.value, 10))
									}
								>
									<option value={4}>4 weeks</option>
									<option value={6}>6 weeks</option>
									<option value={8}>8 weeks</option>
									<option value={12}>12 weeks</option>
								</select>
							</label>
						) : null}
					</div>
				) : null}
				<div className={styles.filterMeta}>
					<span>
						Sort: {sortField} ({sortDirection})
					</span>
					<Button type="button" variant="secondary" onClick={onClearFilters}>
						Clear filters
					</Button>
				</div>
			</div>

			<div className={styles.validationBox}>
				<div className={styles.validationHeader}>
					<strong>In-app consistency check</strong>
					<span
						className={`${styles.validationBadge} ${validationToneMap[validationState.status]}`}
					>
						{validationState.status}
					</span>
				</div>
				<p>{validationState.message}</p>
				{validationState.checkedAt ? (
					<span className={styles.validationTimestamp}>
						Last checked: {validationState.checkedAt}
					</span>
				) : null}
				{validationState.mismatches.length > 0 ? (
					<ul className={styles.mismatchList}>
						{validationState.mismatches.slice(0, 3).map((mismatch) => (
							<li key={mismatch.displayName}>
								<strong>{mismatch.displayName}</strong>: weekly{' '}
								{(mismatch.weeklySeconds / 3600).toFixed(1)}h vs monthly{' '}
								{(mismatch.monthlySeconds / 3600).toFixed(1)}h
							</li>
						))}
					</ul>
				) : null}
			</div>

			<div className={styles.presetsSection}>
				<div className={styles.presetsHeader}>
					<div>
						<strong>Saved presets</strong>
						<p>
							Presets keep reusable filters such as weekly attention-only views
							or a manager-focused weekly view with a fixed trend window.
						</p>
					</div>
					<div className={styles.presetComposer}>
						<input
							type="text"
							value={presetName}
							onChange={(event) => setPresetName(event.target.value)}
							placeholder="Preset name"
						/>
						<Button
							type="button"
							onClick={() => {
								onSavePreset(presetName);
								setPresetName('');
							}}
							disabled={!presetName.trim()}
						>
							Save preset
						</Button>
					</div>
				</div>

				{presets.length > 0 ? (
					<div className={styles.presetList}>
						{presets.map((preset) => (
							<div key={preset.id} className={styles.presetChip}>
								<button
									type="button"
									className={styles.presetApply}
									onClick={() => onApplyPreset(preset)}
								>
									<span>{preset.label}</span>
									<small>{preset.viewMode}</small>
								</button>
								<button
									type="button"
									className={styles.presetRemove}
									onClick={() => onRemovePreset(preset.id)}
									aria-label={`Remove preset ${preset.label}`}
								>
									&times;
								</button>
							</div>
						))}
					</div>
				) : (
					<p className={styles.emptyPresets}>
						No saved presets yet. Save one after you build a useful reports
						view.
					</p>
				)}
			</div>
		</section>
	);
};
