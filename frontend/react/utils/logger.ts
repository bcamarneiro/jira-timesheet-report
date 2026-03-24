function isDebugEnabled(): boolean {
	return process.env.NODE_ENV === 'development';
}

export const logger = {
	debug: (...args: unknown[]) => {
		if (isDebugEnabled()) {
			console.log(...args);
		}
	},
	groupCollapsed: (label: string, callback: () => void) => {
		if (!isDebugEnabled()) return;
		console.groupCollapsed(label);
		try {
			callback();
		} finally {
			console.groupEnd();
		}
	},
	table: (data: unknown) => {
		if (isDebugEnabled()) {
			console.table(data);
		}
	},
	warn: (...args: unknown[]) => {
		console.warn(...args);
	},
	error: (...args: unknown[]) => {
		console.error(...args);
	},
};
