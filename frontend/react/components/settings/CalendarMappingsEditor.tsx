import type React from 'react';
import { useId, useMemo, useState } from 'react';
import type { CalendarMapping } from '../../../stores/useUserDataStore';
import { Button } from '../ui/Button';
import { IssueAutocomplete } from '../ui/IssueAutocomplete';
import * as styles from './CalendarMappingsEditor.module.css';

type Props = {
	mappings: CalendarMapping[];
	onAdd: (mapping: CalendarMapping) => void;
	onUpdate: (issueKey: string, mapping: CalendarMapping) => void;
	onRemove: (issueKey: string) => void;
};

function normalizeIssueKey(value: string): string {
	return value.trim().toUpperCase();
}

function parsePatternList(raw: string): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const entry of raw.split(/[,\n]/)) {
		const trimmed = entry.trim();
		if (!trimmed) continue;
		const key = trimmed.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(trimmed);
	}
	return out;
}

export const CalendarMappingsEditor: React.FC<Props> = ({
	mappings,
	onAdd,
	onUpdate,
	onRemove,
}) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [editingIssueKey, setEditingIssueKey] = useState<string | null>(null);
	const [draftIssueKey, setDraftIssueKey] = useState('');
	const [draftIssueSummary, setDraftIssueSummary] = useState<
		string | undefined
	>(undefined);
	const [draftPatternsRaw, setDraftPatternsRaw] = useState('');
	const issueInputId = useId();
	const patternsInputId = useId();

	const visibleMappings = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();
		if (!normalizedQuery) return mappings;

		return mappings.filter((mapping) => {
			const haystack =
				`${mapping.issueKey} ${mapping.issueSummary ?? ''} ${mapping.patterns.join(' ')}`.toLowerCase();
			return haystack.includes(normalizedQuery);
		});
	}, [mappings, searchQuery]);

	const validationError = useMemo(() => {
		const issueKey = normalizeIssueKey(draftIssueKey);
		const patterns = parsePatternList(draftPatternsRaw);

		if (!issueKey) return 'Pick a Jira issue to map.';
		if (patterns.length === 0)
			return 'Add at least one event title pattern (comma-separate for multiple).';

		const duplicate = mappings.some(
			(mapping) =>
				mapping.issueKey === issueKey && mapping.issueKey !== editingIssueKey,
		);
		if (duplicate) {
			return `${issueKey} already has a mapping. Edit it instead.`;
		}

		return null;
	}, [draftIssueKey, draftPatternsRaw, editingIssueKey, mappings]);

	const resetComposer = () => {
		setEditingIssueKey(null);
		setDraftIssueKey('');
		setDraftIssueSummary(undefined);
		setDraftPatternsRaw('');
	};

	const startEditing = (mapping: CalendarMapping) => {
		setEditingIssueKey(mapping.issueKey);
		setDraftIssueKey(mapping.issueKey);
		setDraftIssueSummary(mapping.issueSummary);
		setDraftPatternsRaw(mapping.patterns.join(', '));
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (validationError) return;

		const nextMapping: CalendarMapping = {
			issueKey: normalizeIssueKey(draftIssueKey),
			issueSummary: draftIssueSummary?.trim() || undefined,
			patterns: parsePatternList(draftPatternsRaw),
		};

		if (editingIssueKey) {
			onUpdate(editingIssueKey, nextMapping);
		} else {
			onAdd(nextMapping);
		}

		resetComposer();
	};

	return (
		<div className={styles.panel}>
			<div className={styles.header}>
				<div>
					<h3>Calendar mappings</h3>
					<p>
						Map a Jira issue to the event titles that should log to it. Many
						recurring meeting names typically point at the same ticket — list
						them all in one mapping. Matching is case-insensitive substring.
					</p>
				</div>
				<div className={styles.headerMeta}>
					<span className={styles.countBadge}>
						{mappings.length} mapping{mappings.length === 1 ? '' : 's'}
					</span>
					{mappings.length > 4 ? (
						<input
							type="search"
							value={searchQuery}
							onChange={(event) => setSearchQuery(event.target.value)}
							placeholder="Search mappings"
							className={styles.searchInput}
						/>
					) : null}
				</div>
			</div>

			{mappings.length > 0 ? (
				<div className={styles.mappingList}>
					{visibleMappings.map((mapping) => (
						<article key={mapping.issueKey} className={styles.mappingCard}>
							<div className={styles.mappingContent}>
								<div className={styles.mappingCell}>
									<span className={styles.cellLabel}>Logs to</span>
									<code>{mapping.issueKey}</code>
									{mapping.issueSummary ? (
										<small>{mapping.issueSummary}</small>
									) : null}
								</div>
								<div className={styles.mappingCell}>
									<span className={styles.cellLabel}>
										Event titles ({mapping.patterns.length})
									</span>
									<div className={styles.patternList}>
										{mapping.patterns.map((pattern) => (
											<span key={pattern} className={styles.patternChip}>
												{pattern}
											</span>
										))}
									</div>
								</div>
							</div>
							<div className={styles.mappingActions}>
								<Button
									type="button"
									variant="secondary"
									onClick={() => startEditing(mapping)}
								>
									Edit
								</Button>
								<button
									type="button"
									className={styles.removeButton}
									onClick={() => {
										if (editingIssueKey === mapping.issueKey) {
											resetComposer();
										}
										onRemove(mapping.issueKey);
									}}
									aria-label={`Remove mapping for ${mapping.issueKey}`}
								>
									&times;
								</button>
							</div>
						</article>
					))}
					{visibleMappings.length === 0 ? (
						<p className={styles.emptyState}>
							No mappings match this search yet.
						</p>
					) : null}
				</div>
			) : (
				<p className={styles.emptyState}>
					No calendar mappings yet. Add one when a recurring meeting title does
					not already include a Jira key.
				</p>
			)}

			<form className={styles.composer} onSubmit={handleSubmit}>
				<div className={styles.composerHeader}>
					<div>
						<strong>
							{editingIssueKey ? 'Edit mapping' : 'Add calendar mapping'}
						</strong>
						<p>
							Pick the Jira issue first, then list every event title that should
							log to it.
						</p>
					</div>
					{editingIssueKey ? (
						<Button type="button" variant="secondary" onClick={resetComposer}>
							Cancel
						</Button>
					) : null}
				</div>
				<div className={styles.composerGrid}>
					<label className={styles.field} htmlFor={issueInputId}>
						<span>Jira issue</span>
						<IssueAutocomplete
							id={issueInputId}
							value={draftIssueKey}
							onChange={(value) => {
								setDraftIssueKey(normalizeIssueKey(value));
								setDraftIssueSummary(undefined);
							}}
							onSelect={(issue) => {
								setDraftIssueKey(issue.key);
								setDraftIssueSummary(issue.summary);
							}}
							placeholder="PROJ-123 or search Jira"
						/>
					</label>
					<label className={styles.field} htmlFor={patternsInputId}>
						<span>Event title patterns</span>
						<textarea
							id={patternsInputId}
							value={draftPatternsRaw}
							onChange={(event) => setDraftPatternsRaw(event.target.value)}
							placeholder={
								'INV3 - daily meeting,\nINV3 weekly sync,\nINV3 retro'
							}
							rows={3}
							autoCapitalize="off"
							autoCorrect="off"
							spellCheck={false}
						/>
						<small className={styles.fieldHint}>
							Comma- or newline-separated. Each pattern matches anywhere in the
							event title (case-insensitive).
						</small>
					</label>
				</div>
				{draftIssueSummary ? (
					<p className={styles.issueSummary}>Selected: {draftIssueSummary}</p>
				) : null}
				<div className={styles.composerFooter}>
					<p className={styles.validationText} aria-live="polite">
						{validationError
							? validationError
							: 'Looks good. Save it to reuse this mapping.'}
					</p>
					<Button type="submit" disabled={!!validationError}>
						{editingIssueKey ? 'Update mapping' : 'Add mapping'}
					</Button>
				</div>
			</form>
		</div>
	);
};
