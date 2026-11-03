<script lang="ts">
	import { player, type Playback } from '../audio/player';
	import type { AlignOp, Evaluation } from '../align/align';
	import { app } from '../state/app.svelte';
	import { buildSchedule, type Schedule } from '../timing/schedule';
	import MorseVisual from './MorseVisual.svelte';

	interface Props {
		evaluation: Evaluation;
		groups: string[];
	}

	let { evaluation, groups }: Props = $props();

	const MARK: Record<AlignOp['kind'], { sign: string; label: string }> = {
		match: { sign: '', label: 'richtig' },
		substitute: { sign: '×', label: 'verwechselt' },
		omit: { sign: '−', label: 'ausgelassen' },
		extra: { sign: '+', label: 'zu viel' }
	};

	/** Ops split back into the sent groups; extras go with the character they precede. */
	const columns = $derived.by(() => {
		const sizes = groups.map((g) => g.length);
		const groupOf = (sentIndex: number) => {
			let rest = sentIndex;
			for (let g = 0; g < sizes.length; g++) {
				if (rest < sizes[g]) return g;
				rest -= sizes[g];
			}
			return sizes.length - 1;
		};
		const result: AlignOp[][] = groups.map(() => []);
		for (const op of evaluation.ops) result[groupOf(op.sentIndex)].push(op);
		return result;
	});

	let replay = $state.raw<{ char: string; schedule: Schedule; playback: Playback } | null>(null);

	function play(char: string) {
		const { charWpm, effectiveWpm, toneHz } = app.data.settings;
		const schedule = buildSchedule(char, { charWpm, effectiveWpm });
		replay = { char, schedule, playback: player.play(schedule, toneHz) };
	}
</script>

<section class="result stack" aria-label="Auswertung">
	<div class="legend muted">
		<span><b class="sign substitute">×</b> verwechselt</span>
		<span><b class="sign omit">−</b> ausgelassen</span>
		<span><b class="sign extra">+</b> zu viel</span>
		<span>Tippe ein Zeichen an, um es nochmal zu hören.</span>
	</div>

	<div class="groups">
		{#each columns as ops, g (g)}
			<div class="group">
				{#each ops as op, i (i)}
					{@const sent = op.kind === 'extra' ? '' : op.sent}
					{@const typed = op.kind === 'match' ? op.sent : op.kind === 'omit' ? '' : op.typed}
					<button
						type="button"
						class="col {op.kind}"
						disabled={!sent}
						onclick={() => play(sent)}
						title={`${MARK[op.kind].label}${sent ? `: gesendet ${sent}` : ''}${typed ? `, getippt ${typed}` : ''}`}
					>
						<span class="sign {op.kind}" aria-hidden="true">{MARK[op.kind].sign}</span>
						<span class="sent mono">{sent || '·'}</span>
						<span class="typed mono">{typed || '·'}</span>
						<span class="visually-hidden">{MARK[op.kind].label}</span>
					</button>
				{/each}
			</div>
		{/each}
	</div>

	<div class="rows-legend muted"><span>oben: gesendet</span><span>unten: deine Mitschrift</span></div>

	{#if replay}
		<div class="replay card">
			<span class="replay-char mono">{replay.char}</span>
			<MorseVisual text={replay.char} schedule={replay.schedule} playback={replay.playback} size="large" labels={false} />
		</div>
	{/if}
</section>

<style>
	.legend,
	.rows-legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-4);
		font-size: 0.875rem;
	}

	.groups {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
	}

	.group {
		display: flex;
		gap: 2px;
		padding: var(--space-1);
		border-radius: var(--radius-s);
		background: var(--surface-2);
	}

	.col {
		min-height: 0;
		padding: 2px 4px 4px;
		border: none;
		border-radius: 6px;
		background: transparent;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
		font-weight: 500;
		min-width: 26px;
	}

	.col:disabled {
		opacity: 1;
		cursor: default;
	}

	.col:hover:not(:disabled) {
		background: var(--surface);
	}

	.sign {
		height: 1rem;
		font-size: 0.8rem;
		font-weight: 700;
		line-height: 1rem;
	}

	.sent,
	.typed {
		font-size: 1.05rem;
		line-height: 1.5;
	}

	.typed {
		color: var(--muted);
	}

	.col.substitute,
	.col.omit,
	.col.extra {
		background: var(--danger-soft);
	}

	.col.substitute .typed,
	.col.extra .typed {
		color: var(--danger);
		font-weight: 700;
		text-decoration: underline wavy;
		text-underline-offset: 3px;
	}

	.col.omit .typed,
	.col.extra .sent {
		color: var(--muted);
	}

	.sign.substitute,
	.sign.omit,
	.sign.extra {
		color: var(--danger);
	}

	.replay {
		display: flex;
		align-items: center;
		gap: var(--space-5);
		padding: var(--space-4) var(--space-5);
	}

	.replay-char {
		font-size: 2rem;
		font-weight: 700;
	}
</style>
