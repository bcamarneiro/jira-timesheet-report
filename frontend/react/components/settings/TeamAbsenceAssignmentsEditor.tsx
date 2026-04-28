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

function assignmentKey(assignment: AbsenceAssignment): string {
	return `${assignment.pattern.toLowerCase()}::${assignment.userEmail.toLowerCase()}`;
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
	const [draftUserEmail, setDraftUserEmail] = useState('');
	const patternInputId = useId();
	const userEmailInputId = useId();
	const datalistId = useId();

	const visibleAssignments = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();
		if (!normalizedQuery) return assignments;

		return assignments.filter((assignment) => {
			const haystack =
				`${assignment.pattern} ${assignment.userEmail}`.toLowerCase();
			return haystack.includes(normalizedQuery);
		});
	}, [assignments, searchQuery]);

	const validationError = useMemo(() => {
		const pattern = normalizePattern(draftPattern);
		const userEmail = normalizeEmailEntry(draftUserEmail);

		if (!pattern) return 'Add an event title pattern to continue.';
		if (!userEmail) return 'Choose which user should receive this time off.';
		if (!isValidEmailEntry(userEmail)) {
			return 'Enter a valid email address for the affected user.';
		}

		const duplicate = assignments.some(
			(assignment) =>
				assignmentKey(assignment) === assignmentKey({ pattern, userEmail }) &&
				(!editingAssignment ||
					assignmentKey(assignment) !== assignmentKey(editingAssignment)),
		);
		if (duplicate) {
			return 'That pattern is already assigned to this user.';
		}

		return null;
	}, [assignments, draftPattern, draftUserEmail, editingAssignment]);

	const resetComposer = () => {
		setEditingAssignment(null);
		setDraftPattern('');
		setDraftUserEmail('');
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (validationError) return;

		const nextAssignment: AbsenceAssignment = {
			pattern: normalizePattern(draftPattern),
			userEmail: normalizeEmailEntry(draftUserEmail),
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
						Use this when one time-off calendar includes several people. Each
						matching title pattern reduces target hours for the assigned user in
						Reports and for you in Dashboard when it matches your email.
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
										Counts as time off for
									</span>
									<code>{assignment.userEmail}</code>
								</div>
							</div>
							<div className={styles.assignmentActions}>
								<Button
									type="button"
									variant="secondary"
									onClick={() => {
										setEditingAssignment(assignment);
										setDraftPattern(assignment.pattern);
										setDraftUserEmail(assignment.userEmail);
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
					calendar mixes several people’s vacations together.
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
							Example: <code>Bruno</code> or <code>Vacation - Daniel</code>.
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
							placeholder="Vacation - Bruno"
						/>
					</label>
					<label className={styles.field} htmlFor={userEmailInputId}>
						<span>Team member email</span>
						<input
							id={userEmailInputId}
							type="email"
							value={draftUserEmail}
							onChange={(event) => setDraftUserEmail(event.target.value)}
							placeholder="bruno@example.com"
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
							Suggestions come from the Team Members list above.
						</small>
					</label>
				</div>
				<div className={styles.composerFooter}>
					<p className={styles.validationText} aria-live="polite">
						{validationError
							? validationError
							: 'Looks good. Save it to reduce that user’s target hours automatically.'}
					</p>
					<Button type="submit" disabled={!!validationError}>
						{editingAssignment ? 'Update assignment' : 'Add assignment'}
					</Button>
				</div>
			</form>
		</div>
	);
};
