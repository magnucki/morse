import type { AlignOp } from '../align/align';

export const WINDOW = 50;
export const MIN_ATTEMPTS = 10;
export const PROBLEM_THRESHOLD = 0.9;

/** typed is null when the character was omitted. */
export type Outcome = { ok: true } | { ok: false; typed: string | null };

export interface CharStats {
	/** Most recent outcomes, oldest first, at most WINDOW entries. */
	recent: Outcome[];
	total: number;
}

export type StatsData = Record<string, CharStats>;

export interface CharSummary {
	char: string;
	total: number;
	/** Attempts in the window. */
	attempts: number;
	/** Hit rate in the window, or null while there are fewer than MIN_ATTEMPTS attempts. */
	rate: number | null;
	/** What the character was confused with in the window, most frequent first. */
	confusions: { char: string; count: number }[];
}

/** Adds one attempt per sent character; extra characters are not attempts. */
export function recordOps(stats: StatsData, ops: AlignOp[]): StatsData {
	const next: StatsData = { ...stats };
	for (const op of ops) {
		if (op.kind === 'extra') continue;
		const outcome: Outcome =
			op.kind === 'match'
				? { ok: true }
				: { ok: false, typed: op.kind === 'substitute' ? op.typed : null };
		const current = next[op.sent] ?? { recent: [], total: 0 };
		next[op.sent] = {
			recent: [...current.recent, outcome].slice(-WINDOW),
			total: current.total + 1
		};
	}
	return next;
}

export function summarize(char: string, stats: CharStats | undefined): CharSummary {
	const recent = stats?.recent ?? [];
	const hits = recent.filter((o) => o.ok).length;
	const confusionCounts = new Map<string, number>();
	for (const o of recent) {
		if (!o.ok && o.typed !== null) confusionCounts.set(o.typed, (confusionCounts.get(o.typed) ?? 0) + 1);
	}
	return {
		char,
		total: stats?.total ?? 0,
		attempts: recent.length,
		rate: recent.length >= MIN_ATTEMPTS ? hits / recent.length : null,
		confusions: [...confusionCounts]
			.map(([c, count]) => ({ char: c, count }))
			.sort((a, b) => b.count - a.count || a.char.localeCompare(b.char))
	};
}

/** Characters with enough data and a hit rate below 90%, worst first. */
export function problemChars(stats: StatsData, chars: string[]): CharSummary[] {
	return chars
		.map((c) => summarize(c, stats[c]))
		.filter((s): s is CharSummary & { rate: number } => s.rate !== null && s.rate < PROBLEM_THRESHOLD)
		.sort((a, b) => a.rate - b.rate);
}
