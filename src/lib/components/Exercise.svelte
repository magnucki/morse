<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import { evaluate, type Evaluation } from '../align/align';
	import { player, type Playback } from '../audio/player';
	import { generateGroups, type Weights } from '../koch/groups';
	import { app } from '../state/app.svelte';
	import { buildSchedule } from '../timing/schedule';
	import MuteHint from './MuteHint.svelte';
	import ResultView from './ResultView.svelte';

	interface Props {
		weights: Weights;
		/** Stores the result; may return a message to show (e.g. a newly unlocked lesson). */
		onresult: (evaluation: Evaluation) => { message?: string; success?: boolean } | void;
		/** Extra actions shown with the result, e.g. a link to the next lesson. */
		after?: Snippet;
	}

	let { weights, onresult, after }: Props = $props();

	type Phase = 'idle' | 'playing' | 'done' | 'result';
	let phase = $state<Phase>('idle');
	let groups = $state<string[]>([]);
	let copy = $state('');
	let playback = $state.raw<Playback | null>(null);
	let progress = $state(0);
	let evaluation = $state<Evaluation | null>(null);
	let feedback = $state<{ message?: string; success?: boolean } | null>(null);
	let input = $state<HTMLTextAreaElement>();

	const totalSeconds = $derived(playback ? Math.round(playback.schedule.duration / 1000) : 0);

	async function start() {
		const { charWpm, effectiveWpm, toneHz, durationMin } = app.data.settings;
		const speed = { charWpm, effectiveWpm };
		groups = generateGroups(weights, durationMin * 60000, speed, Math.random);
		copy = '';
		evaluation = null;
		feedback = null;
		progress = 0;
		const current = player.play(buildSchedule(groups.join(' '), speed), toneHz);
		playback = current;
		phase = 'playing';
		await tick();
		input?.focus();
		input?.scrollIntoView({ block: 'center', behavior: 'smooth' });
		void current.ended.then(() => {
			if (playback === current && phase === 'playing') phase = 'done';
		});
	}

	function cancel() {
		playback = null;
		player.stop();
		phase = 'idle';
		copy = '';
		groups = [];
	}

	function submit() {
		if (phase !== 'done') return;
		const result = evaluate(groups.join(' '), copy);
		evaluation = result;
		feedback = onresult(result) ?? null;
		phase = 'result';
	}

	// Progress bar while playing.
	$effect(() => {
		if (phase !== 'playing' || !playback) return;
		const current = playback;
		let frame = 0;
		const update = () => {
			progress = Math.min(1, Math.max(0, current.position() / current.schedule.duration));
			frame = requestAnimationFrame(update);
		};
		frame = requestAnimationFrame(update);
		return () => cancelAnimationFrame(frame);
	});

	// An exercise that is left (tab hidden, page changed) is cancelled and leaves no trace.
	$effect(() => {
		const onHide = () => {
			if (document.visibilityState === 'hidden' && phase === 'playing') cancel();
		};
		document.addEventListener('visibilitychange', onHide);
		return () => {
			document.removeEventListener('visibilitychange', onHide);
			player.stop();
		};
	});
</script>

<div class="exercise stack">
	{#if phase === 'idle'}
		<div>
			<button type="button" class="primary big" onclick={start}>
				<span aria-hidden="true">▶</span> Übung starten
			</button>
			<p class="muted small">
				{app.data.settings.durationMin} min · Zeichen {app.data.settings.charWpm} WpM · effektiv {app.data
					.settings.effectiveWpm} WpM · {app.data.settings.toneHz} Hz
			</p>
			<MuteHint />
		</div>
	{:else if phase === 'playing' || phase === 'done'}
		<div class="status card">
			<div class="row between">
				<span aria-live="polite">
					{#if phase === 'playing'}
						<span class="pulse" aria-hidden="true"></span> Läuft … {Math.round(progress * totalSeconds)} / {totalSeconds} s
					{:else}
						Fertig. Prüfe deine Mitschrift und werte sie aus.
					{/if}
				</span>
				<button type="button" onclick={cancel}>Abbrechen</button>
			</div>
			<div class="track" aria-hidden="true"><div class="fill" style:width="{progress * 100}%"></div></div>
		</div>

		<form
			class="stack"
			onsubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<label for="copy">Mitschrift</label>
			<textarea
				id="copy"
				bind:this={input}
				bind:value={copy}
				rows="4"
				class="mono copy"
				autocomplete="off"
				{...{ autocorrect: 'off' }}
				autocapitalize="off"
				spellcheck="false"
				enterkeyhint="done"
				placeholder="Tippe, was du hörst. Leerzeichen zwischen den Gruppen sind egal."
			></textarea>
			<button type="submit" class="primary" disabled={phase !== 'done'}>Auswerten</button>
		</form>
		<MuteHint />
	{:else if phase === 'result' && evaluation}
		<div class="score card" class:success={feedback?.success}>
			<div class="percent">{evaluation.percent}<span>%</span></div>
			<div>
				<p class="counts muted">
					{evaluation.correct} von {evaluation.sentCount} richtig · {evaluation.confused} verwechselt ·
					{evaluation.omitted} ausgelassen · {evaluation.extra} zu viel
				</p>
				{#if feedback?.message}<p class="message">{feedback.message}</p>{/if}
			</div>
		</div>

		<ResultView {evaluation} {groups} />

		<div class="row">
			<button type="button" class="primary" onclick={start}>Nochmal</button>
			{@render after?.()}
		</div>
	{/if}
</div>

<style>
	.big {
		min-height: 56px;
		padding: 0 var(--space-6);
		font-size: 1.1rem;
		border-radius: var(--radius);
	}

	.small {
		font-size: 0.875rem;
		margin-top: var(--space-3);
	}

	.status {
		padding: var(--space-3) var(--space-4);
		position: sticky;
		top: 60px;
		z-index: 5;
	}

	.between {
		justify-content: space-between;
	}

	.track {
		height: 4px;
		margin-top: var(--space-3);
		border-radius: 2px;
		background: var(--surface-2);
		overflow: hidden;
	}

	.fill {
		height: 100%;
		background: var(--accent);
	}

	.pulse {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent);
		margin-right: var(--space-1);
		animation: pulse 1s ease-in-out infinite;
	}

	@keyframes pulse {
		50% {
			opacity: 0.3;
		}
	}

	.copy {
		font-size: 1.15rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		resize: vertical;
	}

	.copy::placeholder {
		text-transform: none;
		letter-spacing: normal;
		font-family: var(--font-sans);
		font-size: 0.95rem;
	}

	label {
		margin-bottom: calc(-1 * var(--space-2));
	}

	.score {
		display: flex;
		gap: var(--space-5);
		align-items: center;
	}

	.score.success {
		border-color: var(--accent);
		background: var(--accent-soft);
	}

	.percent {
		font-size: 3rem;
		font-weight: 750;
		line-height: 1;
		letter-spacing: -0.03em;
	}

	.percent span {
		font-size: 1.5rem;
		color: var(--muted);
	}

	.counts {
		margin: 0;
		font-size: 0.95rem;
	}

	.message {
		margin: var(--space-2) 0 0;
		font-weight: 600;
	}

	@media (max-width: 560px) {
		.status {
			top: 52px;
		}

		.score {
			gap: var(--space-4);
			padding: var(--space-4);
		}

		.percent {
			font-size: 2.4rem;
		}
	}
</style>
