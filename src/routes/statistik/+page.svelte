<script lang="ts">
	import { resolve } from '$app/paths';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import { allLessons, LESSON_COUNT } from '#lib/koch/lessons.ts';
	import { app } from '#lib/state/app.svelte.ts';
	import { MIN_ATTEMPTS, summarize, WINDOW } from '#lib/stats/stats.ts';

	let confirmReset: ConfirmDialog;

	const unlocked = $derived(app.data.progress.unlocked);
	const lessons = $derived(allLessons().slice(0, unlocked));
	const chars = $derived(app.unlockedChars.map((c) => summarize(c, app.data.stats[c])));
	const totalAttempts = $derived(chars.reduce((sum, c) => sum + c.total, 0));

	/** Five steps from weak to good, matching the --rate-n tokens. */
	function rateClass(rate: number): string {
		if (rate < 0.7) return 'rate-1';
		if (rate < 0.8) return 'rate-2';
		if (rate < 0.9) return 'rate-3';
		if (rate < 0.95) return 'rate-4';
		return 'rate-5';
	}

	const pct = (rate: number) => `${Math.round(rate * 100)} %`;

	async function reset() {
		if (await confirmReset.ask()) app.reset();
	}
</script>

<svelte:head><title>Statistik · Morse</title></svelte:head>

<h1>Statistik</h1>

<section class="card progress">
	<div class="row between">
		<h2>Lektion {unlocked} von {LESSON_COUNT}</h2>
		<span class="muted">{totalAttempts} Zeichen geübt</span>
	</div>
	<div class="track" role="progressbar" aria-valuemin="1" aria-valuemax={LESSON_COUNT} aria-valuenow={unlocked} aria-label="Lernfortschritt">
		<div class="fill" style:width="{(unlocked / LESSON_COUNT) * 100}%"></div>
	</div>
</section>

<section>
	<h2>Zeichen</h2>
	<p class="muted small">
		Trefferquote der letzten {WINDOW} Versuche je Zeichen. Blass: noch weniger als {MIN_ATTEMPTS} Versuche.
	</p>
	<ul class="grid">
		{#each chars as c (c.char)}
			<li class="cell {c.rate === null ? 'nodata' : rateClass(c.rate)}" title={`${c.char}: ${c.total} Versuche insgesamt`}>
				<span class="char mono">{c.char}</span>
				<span class="rate">{c.rate === null ? '–' : pct(c.rate)}</span>
				<span class="visually-hidden">{c.rate === null ? 'zu wenig Daten' : ''}</span>
			</li>
		{/each}
	</ul>
	<div class="scale muted" aria-hidden="true">
		<span>schwach</span>
		<i class="rate-1"></i><i class="rate-2"></i><i class="rate-3"></i><i class="rate-4"></i><i class="rate-5"></i>
		<span>gut</span>
	</div>
</section>

<section>
	<div class="row between">
		<h2>Problemzeichen</h2>
		{#if app.problems.length > 0}<a class="button primary" href={resolve('/praxis')}>Gezielt üben</a>{/if}
	</div>
	{#if app.problems.length === 0}
		<p class="muted">
			Keine. Ein Zeichen gilt als Problemzeichen, wenn es bei mindestens {MIN_ATTEMPTS} Versuchen unter 90 % liegt.
		</p>
	{:else}
		<ul class="problems">
			{#each app.problems as p (p.char)}
				<li class="card">
					<span class="char mono">{p.char}</span>
					<div class="detail">
						<div class="bar"><div class="fill {rateClass(p.rate ?? 0)}" style:width="{(p.rate ?? 0) * 100}%"></div></div>
						<span class="muted small">
							{pct(p.rate ?? 0)} von {p.attempts} Versuchen
							{#if p.confusions.length > 0}
								· verwechselt mit
								{#each p.confusions.slice(0, 3) as conf, i (conf.char)}{i > 0 ? ', ' : ' '}<b class="mono">{conf.char}</b> ({conf.count}×){/each}
							{/if}
						</span>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<section>
	<h2>Lektionen</h2>
	<div class="table-wrap">
		<table>
			<thead>
				<tr><th>Lektion</th><th>Neues Zeichen</th><th>Bestes Ergebnis</th><th>Übungen</th></tr>
			</thead>
			<tbody>
				{#each lessons as lesson (lesson.number)}
					{@const record = app.data.progress.lessons[lesson.number]}
					<tr>
						<td><a href={resolve('/training/[lesson]', { lesson: String(lesson.number) })}>{lesson.number}</a></td>
						<td class="mono">{lesson.newChar}</td>
						<td>{record ? `${record.best} %` : '–'}</td>
						<td>{record?.count ?? 0}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<section>
	<button type="button" class="danger" onclick={reset}>Fortschritt zurücksetzen</button>
</section>

<ConfirmDialog bind:this={confirmReset} title="Fortschritt zurücksetzen?" confirmLabel="Zurücksetzen" danger>
	Alle Lektionen außer Lektion 1 werden wieder gesperrt und die Statistik wird gelöscht. Deine
	Einstellungen bleiben. Tipp: Exportiere vorher deinen Stand in den Einstellungen.
</ConfirmDialog>

<style>
	section + section {
		margin-top: var(--space-6);
	}

	.between {
		justify-content: space-between;
	}

	.small {
		font-size: 0.875rem;
	}

	.progress h2 {
		margin: 0;
	}

	.track {
		height: 8px;
		margin-top: var(--space-4);
		border-radius: 4px;
		background: var(--surface-2);
		overflow: hidden;
	}

	.track .fill {
		height: 100%;
		background: var(--accent);
		border-radius: 4px;
	}

	.grid {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
		gap: var(--space-2);
	}

	.cell {
		display: grid;
		justify-items: center;
		padding: var(--space-2) 0;
		border-radius: var(--radius-s);
	}

	.cell.nodata {
		background: var(--surface-2);
		color: var(--muted);
	}

	.cell .char {
		font-size: 1.4rem;
		font-weight: 700;
		line-height: 1.3;
	}

	.cell .rate {
		font-size: 0.8rem;
		font-variant-numeric: tabular-nums;
	}

	.scale {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-top: var(--space-3);
		font-size: 0.8rem;
	}

	.scale i {
		width: 20px;
		height: 10px;
		border-radius: 3px;
	}

	.scale span:first-child {
		margin-right: var(--space-1);
	}

	.scale span:last-child {
		margin-left: var(--space-1);
	}

	.problems {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-2);
	}

	.problems li {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-3) var(--space-4);
	}

	.problems .char {
		font-size: 1.6rem;
		font-weight: 700;
		min-width: 1.5em;
		text-align: center;
	}

	.detail {
		flex: 1;
		display: grid;
		gap: var(--space-1);
	}

	.bar {
		height: 8px;
		border-radius: 4px;
		background: var(--surface-2);
		overflow: hidden;
	}

	.bar .fill {
		height: 100%;
		filter: saturate(1.6);
	}

	.table-wrap {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-variant-numeric: tabular-nums;
	}

	th,
	td {
		text-align: left;
		padding: var(--space-2) var(--space-3);
		border-bottom: 1px solid var(--border);
	}

	th {
		font-size: 0.8rem;
		color: var(--muted);
		font-weight: 600;
	}
</style>
