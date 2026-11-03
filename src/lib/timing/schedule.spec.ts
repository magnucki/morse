import { describe, expect, it } from 'vitest';
import { buildSchedule, clampEffective, computeGaps } from './schedule';

describe('timing', () => {
	it('uses 60 ms dots and 180 ms dashes at 20 WpM', () => {
		const s = buildSchedule('K', { charWpm: 20, effectiveWpm: 20 });
		expect(s.segments.map((x) => x.duration)).toEqual([180, 60, 180]);
		// gaps inside the character are one unit
		expect(s.segments.map((x) => x.start)).toEqual([0, 240, 360]);
		expect(s.duration).toBe(540);
	});

	it('uses a 48 ms dot at 25 WpM', () => {
		const s = buildSchedule('E', { charWpm: 25, effectiveWpm: 25 });
		expect(s.segments[0].duration).toBe(48);
	});

	it('uses 3 and 7 unit gaps when speeds are equal', () => {
		expect(computeGaps({ charWpm: 20, effectiveWpm: 20 })).toEqual({ unit: 60, char: 180, word: 420 });
		const s = buildSchedule('EE E', { charWpm: 20, effectiveWpm: 20 });
		expect(s.segments.map((x) => x.start)).toEqual([0, 60 + 180, 60 + 180 + 60 + 420]);
	});

	it('stretches gaps for a lower effective speed but keeps characters fast', () => {
		const slow = computeGaps({ charWpm: 20, effectiveWpm: 10 });
		expect(slow.unit).toBe(60);
		expect(slow.char).toBeGreaterThan(180);
		expect(slow.word).toBeGreaterThan(420);
	});

	it('plays five PARIS words in about 30 s at 20/10 WpM', () => {
		const text = 'PARIS '.repeat(5);
		const speed = { charWpm: 20, effectiveWpm: 10 };
		// duration of the tones and gaps plus the trailing word gap of the last word
		const total = buildSchedule(text, speed).duration + computeGaps(speed).word;
		expect(total).toBeCloseTo(30000, -1);
	});

	it('is exactly 1 minute for 20 PARIS words at 20 WpM', () => {
		const speed = { charWpm: 20, effectiveWpm: 20 };
		const total = buildSchedule('PARIS '.repeat(20), speed).duration + computeGaps(speed).word;
		expect(total).toBeCloseTo(60000, 5);
	});

	it('caps the effective speed at the character speed', () => {
		expect(clampEffective(20, 30)).toBe(20);
		expect(computeGaps({ charWpm: 20, effectiveWpm: 30 })).toEqual({ unit: 60, char: 180, word: 420 });
	});

	it('skips unsupported characters and records character starts', () => {
		const s = buildSchedule('EÄE', { charWpm: 20, effectiveWpm: 20 });
		expect(s.segments.map((x) => x.charIndex)).toEqual([0, 2]);
		expect(s.charStarts.get(2)).toBe(240);
	});
});
