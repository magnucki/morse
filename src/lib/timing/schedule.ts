import { encodeChar } from '../morse/code';

export interface SpeedSettings {
	/** Speed of the characters themselves (PARIS words per minute). */
	charWpm: number;
	/** Overall rate; lower than charWpm stretches the gaps (Farnsworth). */
	effectiveWpm: number;
}

export interface Gaps {
	/** Length of one dot unit in ms. */
	unit: number;
	/** Gap between two characters in ms. */
	char: number;
	/** Gap between two words/groups in ms. */
	word: number;
}

export interface ToneSegment {
	start: number;
	duration: number;
	/** Index of the source character in the played text. */
	charIndex: number;
	kind: 'dot' | 'dash';
}

export interface Schedule {
	segments: ToneSegment[];
	/** Start time of each played character (by index in the text), for visualization. */
	charStarts: Map<number, number>;
	duration: number;
}

export function clampEffective(charWpm: number, effectiveWpm: number): number {
	return Math.min(effectiveWpm, charWpm);
}

export function computeGaps({ charWpm, effectiveWpm }: SpeedSettings): Gaps {
	const unit = 1200 / charWpm;
	const s = clampEffective(charWpm, effectiveWpm);
	if (s >= charWpm) return { unit, char: 3 * unit, word: 7 * unit };
	// ARRL Farnsworth formula: total extra delay per standard word, in seconds.
	const ta = (60 * charWpm - 37.2 * s) / (s * charWpm);
	return { unit, char: ((3 * ta) / 19) * 1000, word: ((7 * ta) / 19) * 1000 };
}

/**
 * Builds the tone schedule for a text. Whitespace separates words; unsupported
 * characters are skipped. Times are in ms from the start of playback.
 */
export function buildSchedule(text: string, speed: SpeedSettings): Schedule {
	const gaps = computeGaps(speed);
	const segments: ToneSegment[] = [];
	const charStarts = new Map<number, number>();
	let t = 0;
	// Gap to insert before the next character: none at the start.
	let pending: 'none' | 'char' | 'word' = 'none';

	[...text].forEach((char, charIndex) => {
		if (/\s/.test(char)) {
			if (pending !== 'none') pending = 'word';
			return;
		}
		const code = encodeChar(char);
		if (!code) return;
		if (pending === 'char') t += gaps.char;
		else if (pending === 'word') t += gaps.word;
		charStarts.set(charIndex, t);
		[...code].forEach((element, i) => {
			if (i > 0) t += gaps.unit;
			const duration = element === '.' ? gaps.unit : 3 * gaps.unit;
			segments.push({ start: t, duration, charIndex, kind: element === '.' ? 'dot' : 'dash' });
			t += duration;
		});
		pending = 'char';
	});

	return { segments, charStarts, duration: t };
}
