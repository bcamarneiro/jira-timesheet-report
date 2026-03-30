function createMemoryStorage(): Storage {
	let store: Record<string, string> = {};

	return {
		get length() {
			return Object.keys(store).length;
		},
		clear() {
			store = {};
		},
		getItem(key) {
			return store[key] ?? null;
		},
		key(index) {
			return Object.keys(store)[index] ?? null;
		},
		removeItem(key) {
			delete store[key];
		},
		setItem(key, value) {
			store[key] = value;
		},
	};
}

const fallbackStorage = createMemoryStorage();

export function getPersistStorage(): Storage {
	const candidate = globalThis.localStorage;
	if (
		candidate &&
		typeof candidate.getItem === 'function' &&
		typeof candidate.setItem === 'function' &&
		typeof candidate.removeItem === 'function'
	) {
		return candidate;
	}
	return fallbackStorage;
}
