import type React from 'react';
import { useId, useMemo, useState } from 'react';
import type { CalendarMapping } from '../../../stores/useUserDataStore';
import { Button } from '../ui/Button';
import { IssueAutocomplete } from '../ui/IssueAutocomplete';
import * as styles from './CalendarMappingsEditor.module.css';

type Props = {
	mappings: CalendarMapping[];
	onAdd: (mapping: CalendarMapping) => void;
	onUpdate: (pattern: string, mapping: CalendarMapping) => void;
	onRemove: (pattern: string) => void;
};

function normalizePattern(value: string): string {
	return value.trim();
}

function normalizeIssueKey(value: string): string {
	return value.trim().toUpperCase();
}

export const CalendarMappingsEditor: React.FC<Props> = ({
	mappings,
	onAdd,
	onUpdate,
	onRemove,
}) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [editingPattern, setEditingPattern] = useState<string | null>(null);
	const [draftPattern, setDraftPattern] = useState('');
	const [draftIssueKey, setDraftIssueKey] = useState('');
	const [draftIssueSummary, setDraftIssueSummary] = useState<string | undefined>(
		undefined,
	);
	const patternInputId = useId();
	const issueInputId = useId();

	const visibleMappings = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();
		if (!normalizedQuery) return mappings;

		return mappings.filter((mapping) => {
			const haystack = `${mapping.pattern} ${mapping.issueKey} ${mapping.issueSummary ?? ''}`.toLowerCase();
			return haystack.includes(normalizedQuery);
		});
	}, [mappings, searchQuery]);

	const validationError = useMemo(() => {
		const pattern = normalizePattern(draftPattern);
		const issueKey = normalizeIssueKey(draftIssueKey);

		if (!pattern) return 'Add an event title pattern to continue.';
		if (!issueKey) return 'Add a Jira issue key to continue.';

		const duplicate = mappings.some(
			(mapping) =>
				mapping.pattern.toLowerCase() === pattern.toLowerCase() &&
				mapping.pattern.toLowerCase() !== editingPattern?.toLowerCase(),
		);
		if (duplicate) {
			return 'Patterns must be unique so one title maps to one issue.';
		}

		return null;
	}, [draftPattern, draftIssueKey, editingPattern, mappings]);

	const resetComposer = () => {
		setEditingPattern(null);
		setDraftPattern('');
		setDraftIssueKey('');
		setDraftIssueSummary(undefined);
	};

	const startEditing = (mapping: CalendarMapping) => {
		setEditingPattern(mapping.pattern);
		setDraftPattern(mapping.pattern);
		setDraftIssueKey(mapping.issueKey);
		setDraftIssueSummary(mapping.issueSummary);
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (validationError) return;

		const nextMapping: CalendarMapping = {
			pattern: normalizePattern(draftPattern),
			issueKey: normalizeIssueKey(draftIssueKey),
			issueSummary: draftIssueSummary?.trim() || undefined,
		};

		if (editingPattern) {
			onUpdate(editingPattern, nextMapping);
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
						Use mappings when recurring meeting titles do not already contain a
						Jira key. Matching is a case-insensitive title substring.
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
						<article key={mapping.pattern} className={styles.mappingCard}>
							<div className={styles.mappingContent}>
								<div className={styles.mappingCell}>
									<span className={styles.cellLabel}>Title contains</span>
									<strong>{mapping.pattern}</strong>
								</div>
								<div className={styles.mappingCell}>
									<span className={styles.cellLabel}>Logs to</span>
									<code>{mapping.issueKey}</code>
									{mapping.issueSummary ? (
										<small>{mapping.issueSummary}</small>
									) : null}
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
										if (editingPattern === mapping.pattern) {
											resetComposer();
										}
										onRemove(mapping.pattern);
									}}
									aria-label={`Remove mapping for ${mapping.pattern}`}
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
					No calendar mappings yet. Start with the titles you reuse most often.
				</p>
			)}

			<form className={styles.composer} onSubmit={handleSubmit}>
				<div className={styles.composerHeader}>
					<div>
						<strong>
							{editingPattern ? 'Edit mapping' : 'Add calendar mapping'}
						</strong>
						<p>
							Shared calendars work best when you map a stable title pattern to a
							reliable issue key.
						</p>
					</div>
					{editingPattern ? (
						<Button type="button" variant="secondary" onClick={resetComposer}>
							Cancel
						</Button>
					) : null}
				</div>
				<div className={styles.composerGrid}>
					<label className={styles.field}>
						<span>Title pattern</span>
						<input
							id={patternInputId}
							type="text"
							value={draftPattern}
							onChange={(event) => setDraftPattern(event.target.value)}
							placeholder="INV3 - daily meeting"
						/>
					</label>
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
						{editingPattern ? 'Update mapping' : 'Add mapping'}
					</Button>
				</div>
			</form>
		</div>
	);
};
