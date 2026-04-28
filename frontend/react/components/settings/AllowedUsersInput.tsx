import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
	formatEmailEntries,
	isValidEmailEntry,
	normalizeEmailEntry,
	splitCsvEmailList,
	splitEmailEntries,
	uniqueEmailEntries,
} from '../../utils/emailList';
import * as styles from './AllowedUsersInput.module.css';

type Props = {
	id: string;
	value: string;
	onChange: (value: string) => void;
	suggestions?: string[];
	placeholder?: string;
};

type Feedback =
	| { tone: 'error' | 'info'; message: string }
	| null;

export const AllowedUsersInput: React.FC<Props> = ({
	id,
	value,
	onChange,
	suggestions = [],
	placeholder,
}) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const tokens = useMemo(() => splitCsvEmailList(value), [value]);
	const [inputValue, setInputValue] = useState('');
	const [feedback, setFeedback] = useState<Feedback>(null);
	const [isFocused, setIsFocused] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(0);

	const availableSuggestions = useMemo(() => {
		const selected = new Set(tokens.map((token) => token.toLowerCase()));
		const query = normalizeEmailEntry(inputValue);

		return uniqueEmailEntries(suggestions)
			.filter((candidate) => !selected.has(candidate.toLowerCase()))
			.filter((candidate) =>
				query ? candidate.toLowerCase().includes(query) : true,
			)
			.filter((candidate) => isValidEmailEntry(candidate));
	}, [inputValue, suggestions, tokens]);

	useEffect(() => {
		return () => {
			if (blurTimeoutRef.current) {
				clearTimeout(blurTimeoutRef.current);
			}
		};
	}, []);

	const setTokens = (entries: string[]) => {
		onChange(formatEmailEntries(entries));
	};

	const applyEntries = (raw: string) => {
		const entries = splitEmailEntries(raw);
		if (entries.length === 0) return false;

		const nextTokens = [...tokens];
		const existing = new Set(tokens.map((token) => token.toLowerCase()));
		const added: string[] = [];
		const invalid: string[] = [];
		let duplicateCount = 0;

		for (const entry of entries) {
			if (!isValidEmailEntry(entry)) {
				invalid.push(entry);
				continue;
			}

			const normalized = normalizeEmailEntry(entry);
			if (existing.has(normalized)) {
				duplicateCount += 1;
				continue;
			}

			existing.add(normalized);
			nextTokens.push(normalized);
			added.push(normalized);
		}

		if (added.length > 0) {
			setTokens(nextTokens);
		}

		if (invalid.length > 0) {
			setFeedback({
				tone: 'error',
				message:
					invalid.length === 1
						? `Couldn't add ${invalid[0]}. Use a valid email address.`
						: `Couldn't add ${invalid.length} entries. Use valid email addresses.`,
			});
		} else if (duplicateCount > 0) {
			setFeedback({
				tone: 'info',
				message:
					duplicateCount === 1
						? 'Skipped 1 duplicate user.'
						: `Skipped ${duplicateCount} duplicate users.`,
			});
		} else {
			setFeedback(null);
		}

		setInputValue('');
		return added.length > 0;
	};

	const commitInputValue = () => {
		if (!inputValue.trim()) return;
		applyEntries(inputValue);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (
			(event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
			availableSuggestions.length > 0
		) {
			event.preventDefault();
			setHighlightedIndex((current) => {
				if (event.key === 'ArrowDown') {
					return (current + 1) % availableSuggestions.length;
				}
				return current <= 0 ? availableSuggestions.length - 1 : current - 1;
			});
			return;
		}

		if (
			event.key === 'Enter' &&
			availableSuggestions.length > 0 &&
			inputValue.trim()
		) {
			event.preventDefault();
			const suggestion = availableSuggestions[highlightedIndex];
			if (suggestion) {
				applyEntries(suggestion);
			}
			return;
		}

		if (event.key === 'Enter' || event.key === 'Tab' || event.key === ',') {
			if (inputValue.trim()) {
				event.preventDefault();
				commitInputValue();
			}
			return;
		}

		if (event.key === 'Backspace' && !inputValue && tokens.length > 0) {
			event.preventDefault();
			setTokens(tokens.slice(0, -1));
			setFeedback(null);
		}
	};

	const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
		const pasted = event.clipboardData.getData('text');
		if (!/[,\n;\t]/.test(pasted) && !/\s+\S+@\S+/.test(pasted)) return;
		event.preventDefault();
		applyEntries(pasted);
	};

	const handleSuggestionMouseDown = (
		event: React.MouseEvent<HTMLButtonElement>,
		suggestion: string,
	) => {
		event.preventDefault();
		applyEntries(suggestion);
	};

	return (
		<div className={styles.field}>
			<label
				htmlFor={id}
				className={`${styles.shell} ${isFocused ? styles.shellFocused : ''}`}
			>
				{tokens.map((token) => (
					<span key={token} className={styles.token}>
						<span className={styles.tokenLabel}>{token}</span>
						<button
							type="button"
							className={styles.tokenRemove}
							onClick={() => {
								setTokens(tokens.filter((entry) => entry !== token));
								setFeedback(null);
							}}
							aria-label={`Remove ${token}`}
						>
							&times;
						</button>
					</span>
				))}
				<input
					ref={inputRef}
					id={id}
					type="text"
					value={inputValue}
					onChange={(event) => {
						setInputValue(event.target.value);
						setHighlightedIndex(0);
						setFeedback(null);
					}}
					onFocus={() => setIsFocused(true)}
					onBlur={() => {
						blurTimeoutRef.current = setTimeout(() => {
							setIsFocused(false);
							commitInputValue();
						}, 120);
					}}
					onKeyDown={handleKeyDown}
					onPaste={handlePaste}
					placeholder={tokens.length === 0 ? placeholder : 'Add another email'}
					className={styles.input}
					autoCapitalize="off"
					autoCorrect="off"
					spellCheck={false}
					autoComplete="off"
					role="combobox"
					aria-expanded={isFocused && availableSuggestions.length > 0}
					aria-controls={id ? `${id}-suggestions` : undefined}
				/>
			</label>

			{isFocused && availableSuggestions.length > 0 ? (
				<div id={`${id}-suggestions`} className={styles.dropdown} role="listbox">
					{availableSuggestions.slice(0, 5).map((suggestion, index) => (
						<button
							key={suggestion}
							type="button"
							role="option"
							aria-selected={highlightedIndex === index}
							className={`${styles.option} ${highlightedIndex === index ? styles.optionActive : ''}`}
							onMouseDown={(event) =>
								handleSuggestionMouseDown(event, suggestion)
							}
						>
							<span>{suggestion}</span>
							<span className={styles.optionHint}>Add member</span>
						</button>
					))}
				</div>
			) : null}

			<div className={styles.meta}>
				<span className={styles.count}>
					{tokens.length === 0
						? 'Leave this empty to include every visible Jira user in Reports.'
						: `${tokens.length} team member${tokens.length === 1 ? '' : 's'} in scope.`}
				</span>
				{feedback ? (
					<span
						className={
							feedback.tone === 'error'
								? styles.feedbackError
								: styles.feedbackInfo
						}
					>
						{feedback.message}
					</span>
				) : null}
			</div>
		</div>
	);
};
