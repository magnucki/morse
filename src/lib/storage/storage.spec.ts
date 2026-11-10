import { describe, expect, it } from 'vitest';
import { defaultData, formatDuration, InvalidDataError, parseAppData, type AppData } from './schema';
import { CORRUPT_KEY, createStore, STORAGE_KEY, type KeyValueStore } from './storage';
import { exportFileName, parseExport, serialize } from './transfer';

function memoryBackend(initial: Record<string, string> = {}): KeyValueStore & { items: Record<string, string> } {
	const items = { ...initial };
	return {
		items,
		getItem: (key) => items[key] ?? null,
		setItem: (key, value) => {
			items[key] = value;
		}
	};
}

const throwingBackend: KeyValueStore = {
	getItem: () => {
		throw new Error('SecurityError');
	},
	setItem: () => {
		throw new Error('QuotaExceededError');
	}
};

const sample = (): AppData => ({
	...defaultData(),
	settings: { charWpm: 22, effectiveWpm: 10, toneHz: 700, durationMin: 3, theme: 'dark', showPatterns: false },
	progress: { unlocked: 4, lessons: { 3: { best: 92, count: 5 } } },
	stats: { K: { recent: [{ ok: true }, { ok: false, typed: 'R' }, { ok: false, typed: null }], total: 3 } }
});

describe('defaults', () => {
	it('match the agreed Koch defaults', () => {
		expect(defaultData()).toEqual({
			version: 1,
			settings: { charWpm: 20, effectiveWpm: 20, toneHz: 600, durationMin: 1, theme: 'system', showPatterns: true },
			progress: { unlocked: 1, lessons: {} },
			stats: {}
		});
	});
});

describe('duration', () => {
	it('allows 30 seconds as the shortest exercise', () => {
		expect(parseAppData({ version: 1, settings: { durationMin: 0.5 } }).settings.durationMin).toBe(0.5);
		expect(() => parseAppData({ version: 1, settings: { durationMin: 0.25 } })).toThrow();
	});

	it('formats durations', () => {
		expect([0.5, 1, 3].map(formatDuration)).toEqual(['30 Sekunden', '1 Minute', '3 Minuten']);
	});
});

describe('validation', () => {
	it('defaults showPatterns to true and keeps false', () => {
		expect(parseAppData({ version: 1, settings: {} }).settings.showPatterns).toBe(true);
		expect(parseAppData({ version: 1, settings: { showPatterns: false } }).settings.showPatterns).toBe(false);
	});

	it('accepts valid data', () => {
		expect(parseAppData(sample())).toEqual(sample());
	});

	it('fills missing parts with defaults', () => {
		const result = parseAppData({ version: 1, settings: { charWpm: 25 } });
		expect(result.settings).toEqual({ ...defaultData().settings, charWpm: 25 });
		expect(result.progress).toEqual({ unlocked: 1, lessons: {} });
	});

	it('caps the effective speed at the character speed', () => {
		expect(parseAppData({ version: 1, settings: { charWpm: 15, effectiveWpm: 30 } }).settings.effectiveWpm).toBe(15);
	});

	it.each([
		['not an object', 'hello'],
		['no version', { settings: {} }],
		['newer version', { version: 99 }],
		['bad showPatterns', { version: 1, settings: { showPatterns: 'yes' } }],
		['bad theme', { version: 1, settings: { theme: 'blue' } }],
		['speed out of range', { version: 1, settings: { charWpm: 500 } }],
		['bad lesson', { version: 1, progress: { unlocked: 41, lessons: {} } }],
		['bad attempt', { version: 1, stats: { K: { recent: [{ ok: 'yes' }], total: 1 } } }]
	])('rejects %s', (_, raw) => {
		expect(() => parseAppData(raw)).toThrow(InvalidDataError);
	});
});

describe('store', () => {
	it('starts with defaults when nothing is stored', () => {
		const result = createStore(() => memoryBackend()).load();
		expect(result).toEqual({ data: defaultData(), persistent: true, recovered: false });
	});

	it('saves and loads', () => {
		const backend = memoryBackend();
		createStore(() => backend).save(sample());
		expect(createStore(() => backend).load().data).toEqual(sample());
	});

	it('falls back to memory when storage is not available', () => {
		const store = createStore(() => {
			throw new Error('SecurityError');
		});
		expect(store.load()).toMatchObject({ persistent: false, data: defaultData() });
		expect(store.save(sample())).toBe(false);
	});

	it('falls back to memory when storage throws on use', () => {
		const store = createStore(() => throwingBackend);
		expect(store.load().persistent).toBe(false);
		expect(store.persistent).toBe(false);
	});

	it('reports a failed save and switches to memory-only', () => {
		const backend = { ...memoryBackend(), setItem: throwingBackend.setItem };
		const store = createStore(() => backend);
		expect(store.save(sample())).toBe(false);
		expect(store.persistent).toBe(false);
	});

	it('moves corrupt data to a backup key and starts fresh', () => {
		const backend = memoryBackend({ [STORAGE_KEY]: '{not json' });
		const result = createStore(() => backend).load();
		expect(result).toMatchObject({ recovered: true, data: defaultData() });
		expect(backend.items[CORRUPT_KEY]).toBe('{not json');
	});
});

describe('export and import', () => {
	it('names the file with the local date', () => {
		expect(exportFileName(new Date(2026, 10, 2, 23, 30))).toBe('morse-trainer-2026-11-02.json');
	});

	it('round-trips the data', () => {
		expect(parseExport(serialize(sample()))).toEqual(sample());
	});

	it('rejects a file that is not an export', () => {
		expect(() => parseExport('{"foo": 1}')).toThrow(InvalidDataError);
		expect(() => parseExport('not json')).toThrow(SyntaxError);
	});
});
