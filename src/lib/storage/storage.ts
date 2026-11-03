import { defaultData, parseAppData, type AppData } from './schema';

export const STORAGE_KEY = 'morse-trainer';
export const CORRUPT_KEY = 'morse-trainer-corrupt';

/** The part of the Web Storage API the app uses. */
export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem'>;

export interface LoadResult {
	data: AppData;
	/** False when storage cannot be used; the app then runs from memory only. */
	persistent: boolean;
	/** True when unreadable data was found and moved to the backup key. */
	recovered: boolean;
}

export interface Store {
	load(): LoadResult;
	/** Returns false when saving failed (the store then stays in memory-only mode). */
	save(data: AppData): boolean;
	readonly persistent: boolean;
}

export function createStore(getBackend: () => KeyValueStore | null): Store {
	let backend: KeyValueStore | null = null;
	try {
		backend = getBackend();
	} catch {
		backend = null;
	}

	return {
		get persistent() {
			return backend !== null;
		},

		load() {
			if (!backend) return { data: defaultData(), persistent: false, recovered: false };
			let raw: string | null;
			try {
				raw = backend.getItem(STORAGE_KEY);
			} catch {
				backend = null;
				return { data: defaultData(), persistent: false, recovered: false };
			}
			if (raw === null) return { data: defaultData(), persistent: true, recovered: false };
			try {
				return { data: parseAppData(JSON.parse(raw)), persistent: true, recovered: false };
			} catch {
				try {
					backend.setItem(CORRUPT_KEY, raw);
				} catch {
					// Keep going with fresh data; the original value stays under STORAGE_KEY until the next save.
				}
				return { data: defaultData(), persistent: true, recovered: true };
			}
		},

		save(data) {
			if (!backend) return false;
			try {
				backend.setItem(STORAGE_KEY, JSON.stringify(data));
				return true;
			} catch {
				backend = null;
				return false;
			}
		}
	};
}

/** The browser's localStorage, or null if it is unavailable. */
export function browserStorage(): KeyValueStore | null {
	if (typeof localStorage === 'undefined') return null;
	// Some private modes expose localStorage but throw on write.
	const probe = `${STORAGE_KEY}-probe`;
	localStorage.setItem(probe, '1');
	localStorage.removeItem(probe);
	return localStorage;
}
