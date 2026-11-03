import { LESSON_COUNT } from '../koch/lessons';

export const UNLOCK_THRESHOLD = 0.9;

export interface LessonRecord {
	/** Best score as whole-number percentage. */
	best: number;
	count: number;
}

export interface Progress {
	/** Highest unlocked lesson. */
	unlocked: number;
	lessons: Record<number, LessonRecord>;
}

export function initialProgress(): Progress {
	return { unlocked: 1, lessons: {} };
}

export function isUnlocked(progress: Progress, lesson: number): boolean {
	return lesson >= 1 && lesson <= progress.unlocked;
}

/**
 * Records a lesson exercise. Only a score of at least 90% in the highest unlocked
 * lesson unlocks the next one.
 */
export function recordLessonResult(
	progress: Progress,
	lesson: number,
	ratio: number,
	percent: number
): { progress: Progress; unlockedLesson: number | null } {
	const previous = progress.lessons[lesson] ?? { best: 0, count: 0 };
	const lessons = {
		...progress.lessons,
		[lesson]: { best: Math.max(previous.best, percent), count: previous.count + 1 }
	};
	const unlocks =
		lesson === progress.unlocked && ratio >= UNLOCK_THRESHOLD && progress.unlocked < LESSON_COUNT;
	const unlocked = unlocks ? progress.unlocked + 1 : progress.unlocked;
	return { progress: { unlocked, lessons }, unlockedLesson: unlocks ? unlocked : null };
}
