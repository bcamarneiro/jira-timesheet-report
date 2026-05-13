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

function mergeEmails(existing: string[], incoming: string[]): string[] {
	const seen = new Set(existing.map((email) => email.toLowerCase()));
	const out = [...existing];
	for (const email of incoming) {
		const normalised = normalizeEmailEntry(email);
		if (!normalised) continue;
		const key = normalised.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(normalised);
	}
	return out;
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
	const [draftEmails, setDraftEmails] = useState<string[]>([]);
	const [draftEmailEntry, setDraftEmailEntry] = useState('');
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

		if (!pattern) return 'Add an event title pattern to continue.';
		if (draftEmails.length === 0) return 'Pick at least one team member.';
		const invalid = draftEmails.find((email) => !isValidEmailEntry(email));
		if (invalid) {
			return `"${invalid}" is not a valid email address.`;
		}

		const duplicate = assignments.some(
			(assignment) =>
				assignmentKey(assignment) ===
					assignmentKey({ pattern, userEmails: draftEmails }) &&
				(!editingAssignment ||
					assignmentKey(assignment) !== assignmentKey(editingAssignment)),
		);
		if (duplicate) {
			return 'That pattern already has an assignment. Edit it instead.';
		}

		return null;
	}, [assignments, draftPattern, draftEmails, editingAssignment]);

	const availableSuggestions = useMemo(() => {
		const selected = new Set(draftEmails.map((email) => email.toLowerCase()));
		return userSuggestions.filter(
			(email) => !selected.has(email.toLowerCase()),
		);
	}, [userSuggestions, draftEmails]);

	const resetComposer = () => {
		setEditingAssignment(null);
		setDraftPattern('');
		setDraftEmails([]);
		setDraftEmailEntry('');
	};

	const commitDraftEntry = () => {
		if (!draftEmailEntry.trim()) return;
		const incoming = draftEmailEntry.split(/[,\n]/);
		setDraftEmails((prev) => mergeEmails(prev, incoming));
		setDraftEmailEntry('');
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		// Flush any half-typed entry sitting in the text input.
		const finalEmails =
			draftEmailEntry.trim().length > 0
				? mergeEmails(draftEmails, draftEmailEntry.split(/[,\n]/))
				: draftEmails;
		if (validationError) return;

		const nextAssignment: AbsenceAssignment = {
			pattern: normalizePattern(draftPattern),
			userEmails: finalEmails,
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
										setDraftEmails([...assignment.userEmails]);
										setDraftEmailEntry('');
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
					<div className={styles.field}>
						<span id={`${emailsInputId}-label`}>Team member email(s)</span>
						<div
							className={styles.emailPicker}
							aria-labelledby={`${emailsInputId}-label`}
						>
							<div className={styles.chipRow}>
								{draftEmails.length === 0 ? (
									<span className={styles.emptyChipRow}>
										No teammates selected yet
									</span>
								) : (
									draftEmails.map((email) => (
										<span key={email} className={styles.emailChip}>
											{email}
											<button
												type="button"
												className={styles.emailChipRemove}
												onClick={() =>
													setDraftEmails((prev) =>
														prev.filter(
															(value) =>
																value.toLowerCase() !== email.toLowerCase(),
														),
													)
												}
												aria-label={`Remove ${email}`}
											>
												&times;
											</button>
										</span>
									))
								)}
							</div>
							<input
								id={emailsInputId}
								type="text"
								value={draftEmailEntry}
								onChange={(event) => setDraftEmailEntry(event.target.value)}
								onKeyDown={(event) => {
									if (
										event.key === 'Enter' ||
										event.key === ',' ||
										event.key === 'Tab'
									) {
										if (draftEmailEntry.trim()) {
											event.preventDefault();
											commitDraftEntry();
										}
									} else if (
										event.key === 'Backspace' &&
										draftEmailEntry === '' &&
										draftEmails.length > 0
									) {
										event.preventDefault();
										setDraftEmails((prev) => prev.slice(0, -1));
									}
								}}
								onBlur={commitDraftEntry}
								placeholder="Type or paste email, then Enter"
								list={datalistId}
								autoCapitalize="off"
								autoCorrect="off"
								spellCheck={false}
							/>
							<datalist id={datalistId}>
								{availableSuggestions.map((suggestion) => (
									<option key={suggestion} value={suggestion} />
								))}
							</datalist>
							<div className={styles.pickerActions}>
								<button
									type="button"
									className={styles.linkButton}
									onClick={() =>
										setDraftEmails((prev) => mergeEmails(prev, userSuggestions))
									}
									disabled={
										userSuggestions.length === 0 ||
										availableSuggestions.length === 0
									}
								>
									Select all from team ({userSuggestions.length})
								</button>
								<button
									type="button"
									className={styles.linkButton}
									onClick={() => setDraftEmails([])}
									disabled={draftEmails.length === 0}
								>
									Clear
								</button>
							</div>
							{availableSuggestions.length > 0 ? (
								<div className={styles.suggestionRow}>
									{availableSuggestions.map((email) => (
										<button
											key={email}
											type="button"
											className={styles.suggestionChip}
											onClick={() =>
												setDraftEmails((prev) => mergeEmails(prev, [email]))
											}
											aria-label={`Add ${email}`}
										>
											+ {email}
										</button>
									))}
								</div>
							) : null}
						</div>
						<small className={styles.fieldHint}>
							Click a teammate to add, the × on a chip to remove. You can also
							paste a comma-separated list.
						</small>
					</div>
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
