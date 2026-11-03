<script lang="ts">
	import MorseVisual from '#lib/components/MorseVisual.svelte';
	import MuteHint from '#lib/components/MuteHint.svelte';
	import { player, type Playback } from '#lib/audio/player.ts';
	import { app } from '#lib/state/app.svelte.ts';
	import { buildSchedule } from '#lib/timing/schedule.ts';
	import { morseToText, textToMorse } from '#lib/translate/translate.ts';

	type Direction = 'text' | 'morse';
	let direction = $state<Direction>('text');
	let textInput = $state('');
	let morseInput = $state('');
	let playback = $state.raw<Playback | null>(null);
	let copied = $state(false);

	const encoded = $derived(textToMorse(textInput));
	const decoded = $derived(morseToText(morseInput));
	/** The plain text that gets played and visualized. */
	const playText = $derived(direction === 'text' ? textInput : decoded.text.replaceAll('?', ' '));
	const speed = $derived({ charWpm: app.data.settings.charWpm, effectiveWpm: app.data.settings.effectiveWpm });
	const schedule = $derived(buildSchedule(playText, speed));
	const output = $derived(direction === 'text' ? encoded.morse : decoded.text);

	function play() {
		const current = player.play(schedule, app.data.settings.toneHz);
		playback = current;
		void current.ended.then(() => {
			if (playback === current) playback = null;
		});
	}

	function stop() {
		player.stop();
		playback = null;
	}

	async function copy() {
		await navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	$effect(() => () => player.stop());
</script>

<svelte:head><title>Übersetzer · Morse</title></svelte:head>

<h1>Übersetzer</h1>

<div class="tabs" role="tablist" aria-label="Richtung">
	<button type="button" role="tab" aria-selected={direction === 'text'} onclick={() => (direction = 'text')}>
		Text → Morse
	</button>
	<button type="button" role="tab" aria-selected={direction === 'morse'} onclick={() => (direction = 'morse')}>
		Morse → Text
	</button>
</div>

<div class="stack">
	{#if direction === 'text'}
		<div>
			<label for="text-in">Text</label>
			<textarea id="text-in" rows="3" bind:value={textInput} placeholder="z. B. CQ CQ DE DL1ABC" spellcheck="false"></textarea>
		</div>
		{#if encoded.unsupported.length > 0}
			<p class="notice">
				Nicht unterstützt und übersprungen: <b class="mono">{encoded.unsupported.join(' ')}</b>
			</p>
		{/if}
	{:else}
		<div>
			<label for="morse-in">Morse</label>
			<textarea
				id="morse-in"
				rows="3"
				class="mono"
				bind:value={morseInput}
				placeholder=".... .. / -.-"
				autocomplete="off"
				{...{ autocorrect: 'off' }}
				autocapitalize="off"
				spellcheck="false"
			></textarea>
			<p class="muted small">Punkt <b>.</b> und Strich <b>-</b>, Leerzeichen zwischen Zeichen, <b>/</b> zwischen Wörtern.</p>
		</div>
		{#if decoded.unknown.length > 0}
			<p class="notice">
				Unbekannte Folge{decoded.unknown.length > 1 ? 'n' : ''}: <b class="mono">{decoded.unknown.join('  ')}</b>
			</p>
		{/if}
	{/if}

	<div class="card out">
		<div class="row between">
			<span class="label">{direction === 'text' ? 'Morse' : 'Text'}</span>
			<div class="row">
				<button type="button" onclick={copy} disabled={!output}>{copied ? 'Kopiert ✓' : 'Kopieren'}</button>
				{#if playback}
					<button type="button" class="primary" onclick={stop}>■ Stopp</button>
				{:else}
					<button type="button" class="primary" onclick={play} disabled={schedule.segments.length === 0}>▶ Abspielen</button>
				{/if}
			</div>
		</div>
		<p class="result mono" aria-live="polite">
			{#if direction === 'text'}
				{encoded.morse || ' '}
			{:else}
				{#each decoded.pieces as piece, i (i)}{#if piece.kind === 'char'}{piece.char}{:else if piece.kind === 'space'}{' '}{:else}<mark title={`Unbekannt: ${piece.code}`}>?</mark>{/if}{/each}
			{/if}
		</p>
		{#if schedule.segments.length > 0}
			<MorseVisual text={playText} {schedule} {playback} />
		{/if}
		<MuteHint />
	</div>
</div>

<style>
	.tabs {
		display: inline-flex;
		padding: 4px;
		gap: 4px;
		border-radius: var(--radius);
		background: var(--surface-2);
		margin-bottom: var(--space-5);
	}

	.tabs button {
		border: none;
		background: transparent;
		min-height: 40px;
		color: var(--muted);
	}

	.tabs button[aria-selected='true'] {
		background: var(--surface);
		color: var(--text);
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.12);
	}

	textarea {
		resize: vertical;
		font-size: 1.05rem;
	}

	.small {
		font-size: 0.875rem;
		margin: var(--space-2) 0 0;
	}

	.between {
		justify-content: space-between;
	}

	.label {
		font-weight: 600;
	}

	.result {
		font-size: 1.25rem;
		line-height: 1.6;
		word-break: break-word;
		min-height: 2em;
		margin: var(--space-4) 0;
		white-space: pre-wrap;
	}

	mark {
		background: var(--danger-soft);
		color: var(--danger);
		border-radius: 4px;
		padding: 0 4px;
		text-decoration: underline wavy;
	}

	.out {
		overflow: hidden;
	}
</style>
