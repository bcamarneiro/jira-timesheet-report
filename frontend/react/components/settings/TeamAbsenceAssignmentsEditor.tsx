import type React from 'react';
import { useId, useMemo, useState } from 'react';
import type { AbsenceAssignment } from '../../../stores/useConfigStore';
import { isValidEmailEntry, normalizeEmailEntry } from '../../utils/emailList';
import { Button } from '../ui/Button';
import * as styles from './TeamAbsenceAssignmentsEditor.module.css';

type Props = {
	assignments: AbsenceAssignment[];
	userSuggestions: string[];
	onAdd: (assignment: AbsenceAssignment) => void;
	onUpdate: (
		original: AbsenceAssignment,
		nextAssignment: AbsenceAssignment,
	) => void;
	onRemove: (assignment: AbsenceAssignment) => void;
};

function normalizePattern(value: string): string {
	return value.trim();
}

function parseEmailList(raw: string): string[] {
	return Array.from(
		new Set(
			raw
				.split(/[,\n]/)
				.map((entry) => normalizeEmailEntry(entry))
				.filter((email) => email.length > 0),
		),
	);
}

function assignmentKey(assignment: AbsenceAssignment): string {
	return assignment.pattern.toLowerCase();
}

export const TeamAbsenceAssignmentsEditor: React.FC<Props> = ({
	assignments,
	userSuggestions,
	onAdd,
	onUpdate,
	onRemove,
}) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [editingAssignment, setEditingAssignment] =
		useState<AbsenceAssignment | null>(null);
	const [draftPattern, setDraftPattern] = useState('');
	const [draftEmailsRaw, setDraftEmailsRaw] = useState('');
	const patternInputId = useId();
	const emailsInputId = useId();
	const datalistId = useId();

	const visibleAssignments = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();
		if (!normalizedQuery) return assignments;

		return assignments.filter((assignment) => {
			const haystack =
				`${assignment.pattern} ${assignment.userEmails.join(' ')}`.toLowerCase();
			return haystack.includes(normalizedQuery);
		});
	}, [assignments, searchQuery]);

	const validationError = useMemo(() => {
		const pattern = normalizePattern(draftPattern);
		const emails = parseEmailList(draftEmailsRaw);

		if (!pattern) return 'Add an event title pattern to continue.';
		if (emails.length === 0)
			return 'Add at least one team member email (comma-separate for multiple).';
		const invalid = emails.find((email) => !isValidEmailEntry(email));
		if (invalid) {
			return `"${invalid}" is not a valid email address.`;
		}

		const duplicate = assignments.some(
			(assignment) =>
				assignmentKey(assignment) === assignmentKey({ pattern, userEmails: emails }) &&
				(!editingAssignment ||
					assignmentKey(assignment) !== assignmentKey(editingAssignment)),
		);
		if (duplicate) {
			return 'That pattern already has an assignment. Edit it instead.';
		}

		return null;
	}, [assignments, draftPattern, draftEmailsRaw, editingAssignment]);

	const resetComposer = () => {
		setEditingAssignment(null);
		setDraftPattern('');
		setDraftEmailsRaw('');
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (validationError) return;

		const nextAssignment: AbsenceAssignment = {
			pattern: normalizePattern(draftPattern),
			userEmails: parseEmailList(draftEmailsRaw),
		};

		if (editingAssignment) {
			onUpdate(editingAssignment, nextAssignment);
		} else {
			onAdd(nextAssignment);
		}

		resetComposer();
	};

	return (
		<div className={styles.panel}>
			<div className={styles.header}>
				<div>
					<h3>Shared calendar assignments</h3>
					<p>
						Use this when one time-off calendar mixes several people, or when a
						public holiday only applies to a region (e.g. Lisbon-only). One
						pattern can route to one or many teammates.
					</p>
				</div>
				<div className={styles.headerMeta}>
					<span className={styles.countBadge}>
						{assignments.length} assignment{assignments.length === 1 ? '' : 's'}
					</span>
					{assignments.length > 4 ? (
						<input
							type="search"
							value={searchQuery}
							onChange={(event) => setSearchQuery(event.target.value)}
							placeholder="Search assignments"
							className={styles.searchInput}
						/>
					) : null}
				</div>
			</div>

			{assignments.length > 0 ? (
				<div className={styles.assignmentList}>
					{visibleAssignments.map((assignment) => (
						<article
							key={assignmentKey(assignment)}
							className={styles.assignmentCard}
						>
							<div className={styles.assignmentContent}>
								<div className={styles.assignmentCell}>
									<span className={styles.cellLabel}>Title contains</span>
									<strong>{assignment.pattern}</strong>
								</div>
								<div className={styles.assignmentCell}>
									<span className={styles.cellLabel}>
										Counts as time off for ({assignment.userEmails.length})
									</span>
									<code>{assignment.userEmails.join(', ')}</code>
								</div>
							</div>
							<div className={styles.assignmentActions}>
								<Button
									type="button"
									variant="secondary"
									onClick={() => {
										setEditingAssignment(assignment);
										setDraftPattern(assignment.pattern);
										setDraftEmailsRaw(assignment.userEmails.join(', '));
									}}
								>
									Edit
								</Button>
								<button
									type="button"
									className={styles.removeButton}
									onClick={() => {
										if (
											editingAssignment &&
											assignmentKey(editingAssignment) ===
												assignmentKey(assignment)
										) {
											resetComposer();
										}
										onRemove(assignment);
									}}
									aria-label={`Remove absence assignment for ${assignment.pattern}`}
								>
									&times;
								</button>
							</div>
						</article>
					))}
					{visibleAssignments.length === 0 ? (
						<p className={styles.emptyState}>
							No assignments match this search yet.
						</p>
					) : null}
				</div>
			) : (
				<p className={styles.emptyState}>
					No shared-calendar assignments yet. Add one when a single time-off
					calendar mixes several people’s vacations together — or to scope a
					regional holiday to a subset of the team.
				</p>
			)}

			<form className={styles.composer} onSubmit={handleSubmit}>
				<div className={styles.composerHeader}>
					<div>
						<strong>
							{editingAssignment
								? 'Edit shared-calendar assignment'
								: 'Add shared-calendar assignment'}
						</strong>
						<p>
							Examples: <code>Vacation - Bruno</code> (one person) or{' '}
							<code>Lisbon Holiday</code> (multiple people for a regional
							holiday).
						</p>
					</div>
					{editingAssignment ? (
						<Button type="button" variant="secondary" onClick={resetComposer}>
							Cancel
						</Button>
					) : null}
				</div>
				<div className={styles.composerGrid}>
					<label className={styles.field} htmlFor={patternInputId}>
						<span>Title pattern</span>
						<input
							id={patternInputId}
							type="text"
							value={draftPattern}
							onChange={(event) => setDraftPattern(event.target.value)}
							placeholder="Lisbon Holiday"
						/>
					</label>
					<label className={styles.field} htmlFor={emailsInputId}>
						<span>Team member email(s)</span>
						<input
							id={emailsInputId}
							type="text"
							value={draftEmailsRaw}
							onChange={(event) => setDraftEmailsRaw(event.target.value)}
							placeholder="alice@example.com, bob@example.com"
							list={datalistId}
							autoCapitalize="off"
							autoCorrect="off"
							spellCheck={false}
						/>
						<datalist id={datalistId}>
							{userSuggestions.map((suggestion) => (
								<option key={suggestion} value={suggestion} />
							))}
						</datalist>
						<small className={styles.fieldHint}>
							Comma-separated for multiple. Suggestions come from your Team
							Members list.
						</small>
					</label>
				</div>
				<div className={styles.composerFooter}>
					<p className={styles.validationText} aria-live="polite">
						{validationError
							? validationError
							: 'Looks good. Save it to reduce target hours for the matched teammate(s) automatically.'}
					</p>
					<Button type="submit" disabled={!!validationError}>
						{editingAssignment ? 'Update assignment' : 'Add assignment'}
					</Button>
				</div>
			</form>
		</div>
	);
};
