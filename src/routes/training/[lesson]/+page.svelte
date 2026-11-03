<script lang="ts">
	import { resolve } from '$app/paths';
	import Exercise from '#lib/components/Exercise.svelte';
	import { lessonWeights } from '#lib/koch/groups.ts';
	import { LESSON_COUNT } from '#lib/koch/lessons.ts';
	import { app } from '#lib/state/app.svelte.ts';
	import { isUnlocked } from '#lib/stats/progress.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const lesson = $derived(data.lesson);
	const unlocked = $derived(isUnlocked(app.data.progress, lesson.number));
	const weights = $derived(lessonWeights(lesson.number));
	let nextUnlocked = $state<number | null>(null);
</script>

<svelte:head><title>Lektion {lesson.number} · Morse</title></svelte:head>

<a class="back muted" href={resolve('/')}>← Alle Lektionen</a>
<h1>Lektion {lesson.number}</h1>

<p class="chars mono" aria-label="Zeichen dieser Lektion">
	{#each lesson.chars as char (char)}
		<span class:new={lesson.number === 1 || char === lesson.newChar}>{char}</span>
	{/each}
</p>
<p class="muted small">
	Neu in dieser Lektion: <b class="mono">{lesson.number === 1 ? 'K und M' : lesson.newChar}</b>
</p>

{#if unlocked}
	{#key lesson.number}
		<Exercise
			{weights}
			onresult={(evaluation) => {
				const isCurrent = lesson.number === app.data.progress.unlocked;
				nextUnlocked = app.recordLesson(lesson.number, evaluation.ops, evaluation.ratio, evaluation.percent);
				if (nextUnlocked) return { success: true, message: `Geschafft! Lektion ${nextUnlocked} ist jetzt frei.` };
				if (isCurrent && lesson.number < LESSON_COUNT) {
					return { message: 'Für die nächste Lektion brauchst du mindestens 90 %. Weiter so!' };
				}
				if (isCurrent && evaluation.ratio >= 0.9) {
					return { success: true, message: 'Stark – du beherrschst alle 41 Zeichen.' };
				}
			}}
		>
			{#snippet after()}
				{#if nextUnlocked}
					<a class="button" href={resolve('/training/[lesson]', { lesson: String(nextUnlocked) })}>
						Zu Lektion {nextUnlocked}
					</a>
				{/if}
				<a class="button" href={resolve('/statistik')}>Statistik</a>
			{/snippet}
		</Exercise>
	{/key}
{:else}
	<div class="notice">
		Diese Lektion ist noch gesperrt. Schaffe mindestens 90 % in Lektion {app.data.progress.unlocked}, um
		die nächste freizuschalten.
	</div>
	<p>
		<a class="button primary" href={resolve('/training/[lesson]', { lesson: String(app.data.progress.unlocked) })}>
			Zu Lektion {app.data.progress.unlocked}
		</a>
	</p>
{/if}

<style>
	.back {
		display: inline-block;
		margin-bottom: var(--space-3);
		text-decoration: none;
		font-size: 0.9rem;
	}

	.chars {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-1);
	}

	.chars span {
		display: inline-grid;
		place-items: center;
		min-width: 36px;
		height: 36px;
		border-radius: var(--radius-s);
		background: var(--surface-2);
		font-size: 1.1rem;
		font-weight: 600;
	}

	.chars span.new {
		background: var(--accent);
		color: var(--accent-text);
	}

	.small {
		font-size: 0.9rem;
		margin-bottom: var(--space-5);
	}

	.notice + p {
		margin-top: var(--space-4);
	}
</style>
