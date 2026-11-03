import { buildSchedule, computeGaps, type SpeedSettings } from '../timing/schedule';
import { getLesson } from './lessons';

export const GROUP_SIZE = 5;
/** Share of problem characters in targeted practice. */
export const PRACTICE_PROBLEM_SHARE = 0.6;

/** Returns a number in [0, 1). Math.random fits; tests pass a seeded one. */
export type Rng = () => number;

export type Weights = Map<string, number>;

/** Small seeded RNG (mulberry32) for reproducible tests. */
export function seededRng(seed: number): Rng {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Every lesson character has weight 1; above lesson 1 the new one weighs max(2, round(n/3)). */
export function lessonWeights(lessonNumber: number): Weights {
	const lesson = getLesson(lessonNumber);
	const weights: Weights = new Map(lesson.chars.map((c) => [c, 1]));
	if (lessonNumber > 1) {
		weights.set(lesson.newChar, Math.max(2, Math.round(lesson.chars.length / 3)));
	}
	return weights;
}

/** Problem characters share about 60%, the other unlocked characters the rest. */
export function practiceWeights(problemChars: string[], unlockedChars: string[]): Weights {
	const unlocked = new Set(unlockedChars);
	const problems = problemChars.filter((c) => unlocked.has(c));
	const others = unlockedChars.filter((c) => !problems.includes(c));
	const weights: Weights = new Map();
	if (problems.length === 0) return weights;
	const problemShare = others.length === 0 ? 1 : PRACTICE_PROBLEM_SHARE;
	for (const c of problems) weights.set(c, problemShare / problems.length);
	for (const c of others) weights.set(c, (1 - problemShare) / others.length);
	return weights;
}

function pick(weights: Weights, rng: Rng): string {
	let total = 0;
	for (const w of weights.values()) total += w;
	let r = rng() * total;
	let last = '';
	for (const [char, w] of weights) {
		last = char;
		r -= w;
		if (r < 0) return char;
	}
	return last;
}

export function generateGroup(weights: Weights, rng: Rng): string {
	let group = '';
	for (let i = 0; i < GROUP_SIZE; i++) group += pick(weights, rng);
	return group;
}

/**
 * Generates groups until their playback reaches about the target duration
 * (always at least one group).
 */
export function generateGroups(
	weights: Weights,
	targetMs: number,
	speed: SpeedSettings,
	rng: Rng
): string[] {
	if (weights.size === 0) throw new Error('No characters to draw from');
	const wordGap = computeGaps(speed).word;
	const groups: string[] = [];
	let total = 0;
	for (;;) {
		const group = generateGroup(weights, rng);
		const length = buildSchedule(group, speed).duration + (groups.length > 0 ? wordGap : 0);
		// Stop before overshooting by more than half a group.
		if (groups.length > 0 && total + length / 2 > targetMs) break;
		groups.push(group);
		total += length;
	}
	return groups;
}
