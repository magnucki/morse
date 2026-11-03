<script lang="ts">
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import MuteHint from '#lib/components/MuteHint.svelte';
	import { player } from '#lib/audio/player.ts';
	import { app } from '#lib/state/app.svelte.ts';
	import { LIMITS, type AppData, type ThemeSetting } from '#lib/storage/schema.ts';
	import { downloadExport, parseExport } from '#lib/storage/transfer.ts';
	import { buildSchedule } from '#lib/timing/schedule.ts';

	const settings = $derived(app.data.settings);
	const durations = [1, 2, 3, 5, 10];
	const themes: { value: ThemeSetting; label: string }[] = [
		{ value: 'system', label: 'System' },
		{ value: 'light', label: 'Hell' },
		{ value: 'dark', label: 'Dunkel' }
	];

	let confirmImport: ConfirmDialog;
	let fileInput: HTMLInputElement;
	let importMessage = $state<{ ok: boolean; text: string } | null>(null);
	let pending = $state<AppData | null>(null);

	const num = (e: Event) => Number((e.currentTarget as HTMLInputElement).value);

	function testTone() {
		player.play(buildSchedule('PARIS', settings), settings.toneHz);
	}

	async function onFile(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		importMessage = null;
		try {
			pending = parseExport(await file.text());
		} catch {
			importMessage = { ok: false, text: 'Diese Datei ist kein gültiger Morse-Trainer-Export. Es wurde nichts geändert.' };
			return;
		}
		if (await confirmImport.ask()) {
			app.replace(pending);
			importMessage = { ok: true, text: `Import erfolgreich: Lektion ${pending.progress.unlocked} ist freigeschaltet.` };
		}
		pending = null;
	}
</script>

<svelte:head><title>Einstellungen · Morse</title></svelte:head>

<h1>Einstellungen</h1>

<section class="card stack">
	<h2>Geschwindigkeit & Ton</h2>

	<div class="field">
		<div class="row between">
			<label for="char-wpm">Zeichengeschwindigkeit</label>
			<output class="mono" for="char-wpm">{settings.charWpm} WpM</output>
		</div>
		<input
			id="char-wpm"
			type="range"
			min={LIMITS.charWpm.min}
			max={LIMITS.charWpm.max}
			value={settings.charWpm}
			oninput={(e) => app.updateSettings({ charWpm: num(e) })}
		/>
		<p class="hint muted">Wie schnell jedes einzelne Zeichen klingt. Koch empfiehlt 20 WpM oder mehr.</p>
	</div>

	<div class="field">
		<div class="row between">
			<label for="eff-wpm">Effektive Geschwindigkeit (Farnsworth)</label>
			<output class="mono" for="eff-wpm">{settings.effectiveWpm} WpM</output>
		</div>
		<input
			id="eff-wpm"
			type="range"
			min={LIMITS.effectiveWpm.min}
			max={settings.charWpm}
			value={settings.effectiveWpm}
			oninput={(e) => app.updateSettings({ effectiveWpm: num(e) })}
		/>
		<p class="hint muted">Niedriger als die Zeichengeschwindigkeit verlängert die Pausen zwischen den Zeichen und Gruppen.</p>
	</div>

	<div class="field">
		<div class="row between">
			<label for="tone">Tonhöhe</label>
			<output class="mono" for="tone">{settings.toneHz} Hz</output>
		</div>
		<input
			id="tone"
			type="range"
			min={LIMITS.toneHz.min}
			max={LIMITS.toneHz.max}
			step="10"
			value={settings.toneHz}
			oninput={(e) => app.updateSettings({ toneHz: num(e) })}
		/>
	</div>

	<div class="row">
		<button type="button" onclick={testTone}>▶ Probe hören</button>
	</div>
	<MuteHint />

	<div class="field">
		<label for="duration">Dauer einer Übung</label>
		<select id="duration" value={settings.durationMin} onchange={(e) => app.updateSettings({ durationMin: num(e) })}>
			{#each durations as d (d)}
				<option value={d}>{d} {d === 1 ? 'Minute' : 'Minuten'}</option>
			{/each}
		</select>
	</div>
</section>

<section class="card stack">
	<h2>Darstellung</h2>
	<div class="segmented" role="radiogroup" aria-label="Farbschema">
		{#each themes as t (t.value)}
			<button
				type="button"
				role="radio"
				aria-checked={settings.theme === t.value}
				onclick={() => app.updateSettings({ theme: t.value })}
			>
				{t.label}
			</button>
		{/each}
	</div>
	<p class="hint muted">„System“ folgt automatisch dem hellen oder dunklen Modus deines Geräts.</p>
</section>

<section class="card stack">
	<h2>Daten sichern</h2>
	<p class="muted">
		Dein Fortschritt liegt nur in diesem Browser. Mit dem Export sicherst du ihn als Datei – und kannst
		ihn auf einem anderen Gerät importieren.
	</p>
	{#if !app.persistent}
		<p class="notice">In diesem Browser kann nicht gespeichert werden. Exportiere deinen Stand vor dem Schließen.</p>
	{/if}
	<div class="row">
		<button type="button" class="primary" onclick={() => downloadExport($state.snapshot(app.data) as AppData)}>
			Exportieren
		</button>
		<button type="button" onclick={() => fileInput.click()}>Importieren …</button>
		<input bind:this={fileInput} type="file" accept="application/json,.json" hidden onchange={onFile} />
	</div>
	{#if importMessage}
		<p class="notice" class:error={!importMessage.ok} role="status">{importMessage.text}</p>
	{/if}
</section>

<ConfirmDialog bind:this={confirmImport} title="Stand importieren?" confirmLabel="Importieren">
	Dein aktueller Fortschritt, die Statistik und die Einstellungen werden durch die Datei ersetzt.
</ConfirmDialog>

<style>
	section + section {
		margin-top: var(--space-5);
	}

	.between {
		justify-content: space-between;
	}

	.field label {
		margin: 0;
	}

	output {
		font-variant-numeric: tabular-nums;
	}

	.hint {
		font-size: 0.875rem;
		margin: var(--space-1) 0 0;
	}

	select {
		max-width: 240px;
	}

	.segmented {
		display: inline-flex;
		padding: 4px;
		gap: 4px;
		border-radius: var(--radius);
		background: var(--surface-2);
	}

	.segmented button {
		border: none;
		background: transparent;
		min-height: 40px;
		color: var(--muted);
	}

	.segmented button[aria-checked='true'] {
		background: var(--surface);
		color: var(--text);
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.12);
	}
</style>
