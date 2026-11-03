import { describe, expect, it } from 'vitest';
import { allLessons, getLesson, KOCH_ORDER, LESSON_COUNT } from './lessons';
import {
	generateGroup,
	generateGroups,
	GROUP_SIZE,
	lessonWeights,
	practiceWeights,
	seededRng
} from './groups';
import { buildSchedule, computeGaps } from '../timing/schedule';

const speed = { charWpm: 20, effectiveWpm: 20 };

describe('lessons', () => {
	it('uses the LCWO order with 41 characters', () => {
		expect(KOCH_ORDER.join('')).toBe('KMURESNAPTLWI.JZ=FOY,VG5/Q92H38B?47C1D60X');
		expect(LESSON_COUNT).toBe(40);
	});

	it('starts with K and M', () => {
		expect(getLesson(1).chars).toEqual(['K', 'M']);
	});

	it('adds one character per lesson and marks it as new', () => {
		const lesson = getLesson(3);
		expect(lesson.chars).toEqual(['K', 'M', 'U', 'R']);
		expect(lesson.newChar).toBe('R');
	});

	it('covers all characters in lesson 40', () => {
		expect(getLesson(40).chars).toHaveLength(41);
		expect(allLessons()).toHaveLength(40);
	});

	it('rejects lessons out of range', () => {
		expect(() => getLesson(0)).toThrow();
		expect(() => getLesson(41)).toThrow();
	});
});

describe('group generation', () => {
	it('builds 5-character groups from the lesson characters only', () => {
		const rng = seededRng(1);
		const weights = lessonWeights(2);
		for (let i = 0; i < 200; i++) {
			const group = generateGroup(weights, rng);
			expect(group).toHaveLength(GROUP_SIZE);
			expect(group).toMatch(/^[KMU]{5}$/);
		}
	});

	it('weights the new character above lesson 1', () => {
		expect(lessonWeights(1)).toEqual(new Map([['K', 1], ['M', 1]]));
		expect(lessonWeights(2).get('U')).toBe(2);
		expect(lessonWeights(5).get('S')).toBe(2);
		expect(lessonWeights(40).get('X')).toBe(14);
	});

	it('draws the new character clearly more often than any other', () => {
		const rng = seededRng(7);
		const counts = new Map<string, number>();
		for (let i = 0; i < 2000; i++) {
			for (const c of generateGroup(lessonWeights(5), rng)) counts.set(c, (counts.get(c) ?? 0) + 1);
		}
		const s = counts.get('S')!;
		for (const [char, n] of counts) if (char !== 'S') expect(s).toBeGreaterThan(n * 1.6);
	});

	it('fills about one minute', () => {
		const groups = generateGroups(lessonWeights(10), 60000, speed, seededRng(3));
		const total = buildSchedule(groups.join(' '), speed).duration;
		// one group at 20 WpM lasts at most about 7 s, so the result is within half a group
		expect(Math.abs(total - 60000)).toBeLessThan(3500);
	});

	it('scales with the duration', () => {
		const one = generateGroups(lessonWeights(10), 60000, speed, seededRng(4)).length;
		const three = generateGroups(lessonWeights(10), 180000, speed, seededRng(4)).length;
		expect(three / one).toBeGreaterThan(2.7);
		expect(three / one).toBeLessThan(3.3);
	});

	it('takes Farnsworth gaps into account', () => {
		const slow = { charWpm: 20, effectiveWpm: 8 };
		const groups = generateGroups(lessonWeights(10), 60000, slow, seededRng(5));
		const total = buildSchedule(groups.join(' '), slow).duration;
		expect(Math.abs(total - 60000)).toBeLessThan(computeGaps(slow).word * 3);
	});
});

describe('targeted practice', () => {
	const unlocked = getLesson(6).chars; // K M U R E S N

	it('draws problem characters about 60% of the time, only unlocked ones', () => {
		const rng = seededRng(9);
		const weights = practiceWeights(['S', 'U'], unlocked);
		let problems = 0;
		let total = 0;
		for (let i = 0; i < 2000; i++) {
			for (const c of generateGroup(weights, rng)) {
				expect(unlocked).toContain(c);
				if (c === 'S' || c === 'U') problems++;
				total++;
			}
		}
		expect(problems / total).toBeGreaterThan(0.55);
		expect(problems / total).toBeLessThan(0.65);
	});

	it('ignores problem characters that are not unlocked', () => {
		expect(practiceWeights(['X'], unlocked).size).toBe(0);
	});

	it('uses only problem characters when nothing else is unlocked', () => {
		expect(practiceWeights(['K', 'M'], ['K', 'M'])).toEqual(new Map([['K', 0.5], ['M', 0.5]]));
	});
});
