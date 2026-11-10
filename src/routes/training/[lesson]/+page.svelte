<script lang="ts">
	import { resolve } from '$app/paths';
	import { player, type Playback } from '#lib/audio/player.ts';
	import Exercise from '#lib/components/Exercise.svelte';
	import MorseVisual from '#lib/components/MorseVisual.svelte';
	import MuteHint from '#lib/components/MuteHint.svelte';
	import { lessonWeights } from '#lib/koch/groups.ts';
	import { LESSON_COUNT } from '#lib/koch/lessons.ts';
	import { app } from '#lib/state/app.svelte.ts';
	import { isUnlocked } from '#lib/stats/progress.ts';
	import { buildSchedule, type Schedule } from '#lib/timing/schedule.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const lesson = $derived(data.lesson);
	const unlocked = $derived(isUnlocked(app.data.progress, lesson.number));
	const weights = $derived(lessonWeights(lesson.number));
	let nextUnlocked = $state<number | null>(null);

	const newChars = $derived(lesson.number === 1 ? ['K', 'M'] : [lesson.newChar]);

	interface Shown {
		text: string;
		schedule: Schedule;
		playback: Playback | null;
	}

	function speed() {
		const { charWpm, effectiveWpm } = app.data.settings;
		return { charWpm, effectiveWpm };
	}

	/** What the pattern area shows: the new characters until something is played. */
	let played = $state.raw<Shown | null>(null);
	const shown = $derived<Shown>(
		played ?? { text: newChars.join(' '), schedule: buildSchedule(newChars.join(' '), speed()), playback: null }
	);

	function playText(text: string, visualText = text) {
		const schedule = buildSchedule(text, speed());
		const playback = player.play(schedule, app.data.settings.toneHz);
		played = { text: visualText, schedule, playback };
	}

	/** Each new character three times, repetitions separated by word gaps. */
	function listen() {
		playText(newChars.map((c) => `${c} ${c} ${c}`).join(' '));
	}

	$effect(() => () => player.stop());
</script>

<svelte:head><title>Lektion {lesson.number} · Morse</title></svelte:head>

<a class="back muted" href={resolve('/')}>← Alle Lektionen</a>
<h1>Lektion {lesson.number}</h1>

<section class="intro card stack" aria-label="Neues Zeichen">
	<p class="muted small">Neu in dieser Lektion</p>
	<div class="intro-main">
		<div class="big-chars mono">{newChars.join(' ')}</div>
		<button type="button" class="primary" onclick={listen}><span aria-hidden="true">▶</span> Anhören</button>
	</div>
	{#if app.data.settings.showPatterns}
		<div class="pattern">
			{#key shown.schedule}
				<MorseVisual text={shown.text} schedule={shown.schedule} playback={shown.playback} size="large" />
			{/key}
		</div>
	{/if}
	<MuteHint />
</section>

<p class="chars mono" role="group" aria-label="Zeichen dieser Lektion – antippen zum Anhören">
	{#each lesson.chars as char (char)}
		<button type="button" class="tile" class:new={lesson.number === 1 || char === lesson.newChar} onclick={() => playText(char)}>
			{char}
		</button>
	{/each}
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

	.chars .tile {
		display: inline-grid;
		padding: 0;
		border: 0;
		cursor: pointer;
		color: inherit;
		font: inherit;
		place-items: center;
		min-width: 36px;
		height: 36px;
		border-radius: var(--radius-s);
		background: var(--surface-2);
		font-size: 1.1rem;
		font-weight: 600;
	}

	.chars .tile.new {
		background: var(--accent);
		color: var(--accent-text);
	}

	.chars {
		margin-bottom: var(--space-5);
	}

	.small {
		font-size: 0.9rem;
		margin: 0;
	}

	.intro {
		margin-bottom: var(--space-4);
	}

	.intro-main {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.big-chars {
		font-size: 3rem;
		font-weight: 750;
		line-height: 1;
		letter-spacing: 0.1em;
	}

	.pattern {
		min-height: 52px;
		overflow-x: auto;
	}

	.notice + p {
		margin-top: var(--space-4);
	}
</style>
