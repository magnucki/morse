import { LESSON_COUNT } from '../koch/lessons';
import { initialProgress, type LessonRecord, type Progress } from '../stats/progress';
import { WINDOW, type CharStats, type Outcome, type StatsData } from '../stats/stats';

export const CURRENT_VERSION = 1;

export type ThemeSetting = 'system' | 'light' | 'dark';

export interface Settings {
	charWpm: number;
	effectiveWpm: number;
	toneHz: number;
	/** Exercise duration in minutes; 0.5 is the shortest. */
	durationMin: number;
	theme: ThemeSetting;
	/** Show dot/dash patterns on the lesson page. */
	showPatterns: boolean;
}

export interface AppData {
	version: typeof CURRENT_VERSION;
	settings: Settings;
	progress: Progress;
	stats: StatsData;
}

export const LIMITS = {
	charWpm: { min: 5, max: 50 },
	effectiveWpm: { min: 2, max: 50 },
	toneHz: { min: 300, max: 1200 },
	durationMin: { min: 0.5, max: 10 }
} as const;

/** Human-readable exercise duration, e.g. "30 Sekunden", "1 Minute", "3 Minuten". */
export function formatDuration(minutes: number): string {
	if (minutes < 1) return `${Math.round(minutes * 60)} Sekunden`;
	return `${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}`;
}

export function defaultSettings(): Settings {
	return { charWpm: 20, effectiveWpm: 20, toneHz: 600, durationMin: 1, theme: 'system', showPatterns: true };
}

export function defaultData(): AppData {
	return { version: CURRENT_VERSION, settings: defaultSettings(), progress: initialProgress(), stats: {} };
}

export class InvalidDataError extends Error {}

const isObject = (v: unknown): v is Record<string, unknown> =>
	typeof v === 'object' && v !== null && !Array.isArray(v);

function fail(message: string): never {
	throw new InvalidDataError(message);
}

function number(v: unknown, name: string, min: number, max: number): number {
	if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) fail(`Invalid ${name}`);
	return v;
}

/** Missing settings fall back to defaults; present but invalid values are rejected. */
function parseSettings(raw: unknown): Settings {
	const defaults = defaultSettings();
	if (raw === undefined) return defaults;
	if (!isObject(raw)) fail('Invalid settings');
	const pick = <K extends keyof typeof LIMITS>(key: K) =>
		raw[key] === undefined ? defaults[key] : number(raw[key], key, LIMITS[key].min, LIMITS[key].max);
	const charWpm = pick('charWpm');
	const theme = raw.theme === undefined ? defaults.theme : raw.theme;
	if (theme !== 'system' && theme !== 'light' && theme !== 'dark') fail('Invalid theme');
	const showPatterns = raw.showPatterns === undefined ? defaults.showPatterns : raw.showPatterns;
	if (typeof showPatterns !== 'boolean') fail('Invalid showPatterns');
	return {
		charWpm,
		effectiveWpm: Math.min(pick('effectiveWpm'), charWpm),
		toneHz: pick('toneHz'),
		durationMin: pick('durationMin'),
		theme,
		showPatterns
	};
}

function parseProgress(raw: unknown): Progress {
	if (raw === undefined) return initialProgress();
	if (!isObject(raw)) fail('Invalid progress');
	const unlocked = number(raw.unlocked, 'unlocked lesson', 1, LESSON_COUNT);
	if (!Number.isInteger(unlocked)) fail('Invalid unlocked lesson');
	if (!isObject(raw.lessons)) fail('Invalid lessons');
	const lessons: Record<number, LessonRecord> = {};
	for (const [key, value] of Object.entries(raw.lessons)) {
		const lesson = Number(key);
		if (!Number.isInteger(lesson) || lesson < 1 || lesson > LESSON_COUNT || !isObject(value)) {
			fail('Invalid lesson record');
		}
		lessons[lesson] = {
			best: number(value.best, 'best score', 0, 100),
			count: number(value.count, 'exercise count', 0, Number.MAX_SAFE_INTEGER)
		};
	}
	return { unlocked, lessons };
}

function parseOutcome(raw: unknown): Outcome {
	if (!isObject(raw)) fail('Invalid attempt');
	if (raw.ok === true) return { ok: true };
	if (raw.ok === false && (raw.typed === null || (typeof raw.typed === 'string' && raw.typed.length === 1))) {
		return { ok: false, typed: raw.typed };
	}
	fail('Invalid attempt');
}

function parseStats(raw: unknown): StatsData {
	if (raw === undefined) return {};
	if (!isObject(raw)) fail('Invalid statistics');
	const stats: StatsData = {};
	for (const [char, value] of Object.entries(raw)) {
		if (char.length !== 1 || !isObject(value) || !Array.isArray(value.recent)) fail('Invalid statistics');
		const recent = value.recent.map(parseOutcome).slice(-WINDOW);
		const total = number(value.total, 'attempt count', recent.length, Number.MAX_SAFE_INTEGER);
		stats[char] = { recent, total } satisfies CharStats;
	}
	return stats;
}

/** Converters from version n to n + 1, keyed by n. Empty while only version 1 exists. */
const MIGRATIONS: Record<number, (data: Record<string, unknown>) => Record<string, unknown>> = {};

/** Brings data of any known version up to the current one and validates it. */
export function parseAppData(raw: unknown): AppData {
	if (!isObject(raw)) fail('Not a Morse Trainer data object');
	let data = raw;
	let version = data.version;
	if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) fail('Missing format version');
	if (version > CURRENT_VERSION) fail('Data comes from a newer version of the app');
	while (version < CURRENT_VERSION) {
		data = MIGRATIONS[version](data);
		version++;
	}
	return {
		version: CURRENT_VERSION,
		settings: parseSettings(data.settings),
		progress: parseProgress(data.progress),
		stats: parseStats(data.stats)
	};
}
