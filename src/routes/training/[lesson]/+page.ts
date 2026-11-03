import { error } from '@sveltejs/kit';
import { getLesson, LESSON_COUNT } from '#lib/koch/lessons.ts';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () =>
	Array.from({ length: LESSON_COUNT }, (_, i) => ({ lesson: String(i + 1) }));

export const load: PageLoad = ({ params }) => {
	const number = Number(params.lesson);
	if (!Number.isInteger(number) || number < 1 || number > LESSON_COUNT) error(404, 'Diese Lektion gibt es nicht');
	return { lesson: getLesson(number) };
};
