import { describe, expect, it } from 'vitest';
import { evaluate, type AlignOp } from '../align/align';
import { problemChars, recordOps, summarize, type CharStats, type Outcome } from './stats';
import { initialProgress, recordLessonResult } from './progress';

const ok: Outcome = { ok: true };
const fail = (typed: string | null = 'X'): Outcome => ({ ok: false, typed });
const stats = (...outcomes: Outcome[]): CharStats => ({ recent: outcomes, total: outcomes.length });
const repeat = (o: Outcome, n: number) => Array.from({ length: n }, () => o);

describe('attempts', () => {
	it('counts every sent character, not extras', () => {
		const { ops } = evaluate('SKSKS SKS', 'SKHKS SKSS');
		const result = recordOps({}, ops);
		expect(result.S.total).toBe(5);
		expect(result.S.recent.filter((o) => o.ok)).toHaveLength(4);
		expect(result.S.recent).toContainEqual({ ok: false, typed: 'H' });
		expect(result.K.total).toBe(3);
	});

	it('records omissions with typed null', () => {
		const ops: AlignOp[] = [{ kind: 'omit', sent: 'S', sentIndex: 0 }];
		expect(recordOps({}, ops).S.recent).toEqual([{ ok: false, typed: null }]);
	});

	it('keeps only the last 50 attempts but counts all', () => {
		let data = {};
		const failOps: AlignOp[] = [{ kind: 'substitute', sent: 'U', typed: 'V', sentIndex: 0 }];
		const okOps: AlignOp[] = [{ kind: 'match', sent: 'U', sentIndex: 0 }];
		for (let i = 0; i < 20; i++) data = recordOps(data, failOps);
		for (let i = 0; i < 50; i++) data = recordOps(data, okOps);
		const summary = summarize('U', (data as Record<string, CharStats>).U);
		expect(summary.rate).toBe(1);
		expect(summary.total).toBe(70);
	});
});

describe('summaries', () => {
	it('computes the rate over fewer than 50 attempts', () => {
		expect(summarize('K', stats(...repeat(ok, 15), ...repeat(fail(), 5))).rate).toBe(0.75);
	});

	it('reports too little data below 10 attempts', () => {
		expect(summarize('K', stats(ok, ok, fail(), ok)).rate).toBeNull();
		expect(summarize('K', undefined)).toMatchObject({ rate: null, total: 0 });
	});

	it('lists confusions most frequent first', () => {
		const s = stats(...repeat(fail('I'), 2), ...repeat(fail('H'), 6), fail(null), ...repeat(ok, 10));
		expect(summarize('S', s).confusions).toEqual([
			{ char: 'H', count: 6 },
			{ char: 'I', count: 2 }
		]);
	});
});

describe('problem characters', () => {
	const data = {
		U: stats(...repeat(ok, 29), ...repeat(fail(), 11)), // 72%
		S: stats(...repeat(ok, 18), ...repeat(fail(), 12)), // 60%
		K: stats(...repeat(ok, 38), ...repeat(fail(), 2)), // 95%
		M: stats(fail(), fail(), fail()) // too little data
	};

	it('lists characters below 90% with enough data, worst first', () => {
		const result = problemChars(data, ['K', 'M', 'U', 'S']);
		expect(result.map((s) => s.char)).toEqual(['S', 'U']);
	});

	it('does not list good characters or characters with too little data', () => {
		const chars = problemChars(data, ['K', 'M']).map((s) => s.char);
		expect(chars).toEqual([]);
	});

	it('treats exactly 90% as not a problem', () => {
		const chars = problemChars({ R: stats(...repeat(ok, 9), fail()) }, ['R']);
		expect(chars).toEqual([]);
	});
});

describe('lesson progress', () => {
	it('unlocks the next lesson at 90% in the highest unlocked lesson', () => {
		const start = { unlocked: 3, lessons: {} };
		const { progress, unlockedLesson } = recordLessonResult(start, 3, 0.92, 92);
		expect(progress.unlocked).toBe(4);
		expect(unlockedLesson).toBe(4);
	});

	it('does not unlock below 90%', () => {
		const { progress, unlockedLesson } = recordLessonResult({ unlocked: 3, lessons: {} }, 3, 0.85, 85);
		expect(progress.unlocked).toBe(3);
		expect(unlockedLesson).toBeNull();
	});

	it('does not unlock from an older lesson', () => {
		const { progress } = recordLessonResult({ unlocked: 5, lessons: {} }, 2, 1, 100);
		expect(progress.unlocked).toBe(5);
	});

	it('does not go past lesson 40', () => {
		const { progress, unlockedLesson } = recordLessonResult({ unlocked: 40, lessons: {} }, 40, 1, 100);
		expect(progress.unlocked).toBe(40);
		expect(unlockedLesson).toBeNull();
	});

	it('tracks best score and exercise count per lesson', () => {
		let p = initialProgress();
		p = recordLessonResult(p, 1, 0.7, 70).progress;
		p = recordLessonResult(p, 1, 0.84, 84).progress;
		p = recordLessonResult(p, 1, 0.8, 80).progress;
		expect(p.lessons[1]).toEqual({ best: 84, count: 3 });
	});

	it('starts with only lesson 1 unlocked', () => {
		expect(initialProgress()).toEqual({ unlocked: 1, lessons: {} });
	});
});
