/** Koch teaching order as used by LCWO. */
export const KOCH_ORDER: readonly string[] = [
	...'KMURESNAPTLWI.JZ=FOY,VG5/Q92H38B?47C1D60X'
];

export const LESSON_COUNT = KOCH_ORDER.length - 1; // 40

export interface Lesson {
	number: number;
	chars: string[];
	/** The character this lesson adds (lesson 1 introduces two, this is the second). */
	newChar: string;
}

export function getLesson(number: number): Lesson {
	if (!Number.isInteger(number) || number < 1 || number > LESSON_COUNT) {
		throw new RangeError(`No lesson ${number}`);
	}
	const chars = KOCH_ORDER.slice(0, number + 1);
	return { number, chars, newChar: chars[chars.length - 1] };
}

export function allLessons(): Lesson[] {
	return Array.from({ length: LESSON_COUNT }, (_, i) => getLesson(i + 1));
}

/** Characters of all lessons up to and including the given one. */
export function charsUpTo(lesson: number): string[] {
	return getLesson(lesson).chars;
}
