import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	type JiraSearchResult,
	searchJiraIssues,
} from '../../../services/jiraSearchService';
import { useConfigStore } from '../../../stores/useConfigStore';
import * as styles from './IssueAutocomplete.module.css';
import { Spinner } from './Spinner';

type Props = {
	value: string;
	onChange: (value: string) => void;
	onSelect: (issue: { key: string; summary: string }) => void;
	placeholder?: string;
	id?: string;
};

export const IssueAutocomplete: React.FC<Props> = ({
	value,
	onChange,
	onSelect,
	placeholder,
	id,
}) => {
	const config = useConfigStore((s) => s.config);
	const [results, setResults] = useState<JiraSearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const abortRef = useRef<AbortController | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const listboxId = id ? `${id}-listbox` : undefined;

	const doSearch = useCallback(
		async (query: string) => {
			// Cancel previous in-flight request
			if (abortRef.current) {
				abortRef.current.abort();
			}

			if (!query.trim() || query.trim().length < 2) {
				setResults([]);
				setShowDropdown(false);
				setHasSearched(false);
				setHighlightedIndex(-1);
				return;
			}

			const controller = new AbortController();
			abortRef.current = controller;
			setIsLoading(true);

			try {
				const issues = await searchJiraIssues(config, query, controller.signal);
				if (!controller.signal.aborted) {
					setResults(issues);
					setShowDropdown(true);
					setHasSearched(true);
					setHighlightedIndex(issues.length > 0 ? 0 : -1);
				}
			} catch {
				if (!controller.signal.aborted) {
					setResults([]);
					setHasSearched(true);
					setHighlightedIndex(-1);
				}
			} finally {
				if (!controller.signal.aborted) {
					setIsLoading(false);
				}
			}
		},
		[config],
	);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		onChange(val);

		// Debounce the search
		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current);
		}

		debounceTimer.current = setTimeout(() => {
			doSearch(val);
		}, 300);
	};

	const handleSelect = (issue: JiraSearchResult) => {
		onSelect(issue);
		setShowDropdown(false);
		setResults([]);
		setHasSearched(false);
		setHighlightedIndex(-1);
	};

	const handleFocus = () => {
		if (results.length > 0) {
			setShowDropdown(true);
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (!showDropdown || results.length === 0) {
			if (event.key === 'ArrowDown' && results.length > 0) {
				event.preventDefault();
				setShowDropdown(true);
				setHighlightedIndex(0);
			}
			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			setHighlightedIndex((current) => (current + 1) % results.length);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			setHighlightedIndex((current) =>
				current <= 0 ? results.length - 1 : current - 1,
			);
		} else if (event.key === 'Enter' && highlightedIndex >= 0) {
			event.preventDefault();
			handleSelect(results[highlightedIndex]);
		} else if (event.key === 'Escape') {
			event.preventDefault();
			setShowDropdown(false);
			setHighlightedIndex(-1);
		}
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setShowDropdown(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Clean up on unmount
	useEffect(() => {
		return () => {
			if (debounceTimer.current) {
				clearTimeout(debounceTimer.current);
			}
			if (abortRef.current) {
				abortRef.current.abort();
			}
		};
	}, []);

	return (
		<div ref={containerRef} className={styles.container}>
			<input
				type="text"
				id={id}
				value={value}
				onChange={handleChange}
				onFocus={handleFocus}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				className={styles.input}
				autoComplete="off"
				role="combobox"
				aria-expanded={showDropdown}
				aria-controls={listboxId}
				aria-autocomplete="list"
				aria-activedescendant={
					highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined
				}
			/>
			{showDropdown && (
				<div id={listboxId} className={styles.dropdown} role="listbox">
					{isLoading && (
						<div className={styles.loading} aria-live="polite">
							<Spinner size="sm" />
							<span>Searching...</span>
						</div>
					)}
					{!isLoading && hasSearched && results.length === 0 && (
						<div className={styles.noResults}>No issues found</div>
					)}
					{!isLoading &&
						results.map((issue) => (
							<button
								key={issue.key}
								id={`${listboxId}-option-${results.indexOf(issue)}`}
								type="button"
								className={`${styles.item} ${highlightedIndex === results.indexOf(issue) ? styles.itemActive : ''}`}
								onClick={() => handleSelect(issue)}
								onMouseEnter={() => setHighlightedIndex(results.indexOf(issue))}
								role="option"
								aria-selected={highlightedIndex === results.indexOf(issue)}
							>
								<span className={styles.itemKey}>{issue.key}</span>
								<span className={styles.itemSummary}>{issue.summary}</span>
							</button>
						))}
				</div>
			)}
		</div>
	);
};
