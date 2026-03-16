import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	type JiraSearchResult,
	searchJiraIssues,
} from '../../../services/jiraSearchService';
import { useConfigStore } from '../../../stores/useConfigStore';
import * as styles from './IssueAutocomplete.module.css';

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
	const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const abortRef = useRef<AbortController | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

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
				}
			} catch {
				if (!controller.signal.aborted) {
					setResults([]);
					setHasSearched(true);
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
	};

	const handleFocus = () => {
		if (results.length > 0) {
			setShowDropdown(true);
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
				placeholder={placeholder}
				className={styles.input}
				autoComplete="off"
			/>
			{showDropdown && (
				<div className={styles.dropdown}>
					{isLoading && <div className={styles.loading}>Searching...</div>}
					{!isLoading && hasSearched && results.length === 0 && (
						<div className={styles.noResults}>No issues found</div>
					)}
					{!isLoading &&
						results.map((issue) => (
							<button
								key={issue.key}
								type="button"
								className={styles.item}
								onClick={() => handleSelect(issue)}
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
