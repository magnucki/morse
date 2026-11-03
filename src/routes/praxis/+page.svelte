<script lang="ts">
	import { resolve } from '$app/paths';
	import Exercise from '#lib/components/Exercise.svelte';
	import { practiceWeights } from '#lib/koch/groups.ts';
	import { app } from '#lib/state/app.svelte.ts';

	// Fixed when the page opens, so the drawn characters don't change mid-session.
	const problems = app.problems.map((p) => p.char);
	const weights = practiceWeights(problems, app.unlockedChars);
</script>

<svelte:head><title>Problemzeichen üben · Morse</title></svelte:head>

<a class="back muted" href={resolve('/')}>← Alle Lektionen</a>
<h1>Problemzeichen üben</h1>

{#if problems.length === 0}
	<div class="notice">
		Noch nichts zu üben: Kein Zeichen liegt bei mindestens 10 Versuchen unter 90 %. Übe weiter in den
		Lektionen – sobald ein Zeichen Probleme macht, taucht es hier auf.
	</div>
{:else}
	<p class="muted">
		Etwa 60 % der Zeichen kommen aus deinen Problemzeichen, der Rest aus den übrigen freigeschalteten.
		Das Ergebnis fließt in die Statistik ein, schaltet aber keine Lektion frei.
	</p>
	<p class="chars mono" aria-label="Problemzeichen">
		{#each app.problems as p (p.char)}
			<span>{p.char} <small>{Math.round((p.rate ?? 0) * 100)} %</small></span>
		{/each}
	</p>
	<Exercise
		{weights}
		onresult={(evaluation) => {
			app.recordPractice(evaluation.ops);
		}}
	>
		{#snippet after()}
			<a class="button" href={resolve('/statistik')}>Statistik</a>
		{/snippet}
	</Exercise>
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
		margin-bottom: var(--space-5);
	}

	.chars span {
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-s);
		background: var(--danger-soft);
		font-weight: 700;
		font-size: 1.1rem;
	}

	.chars small {
		font-weight: 500;
		font-size: 0.8rem;
		color: var(--muted);
	}
</style>
