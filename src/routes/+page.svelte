<script lang="ts">
	import { resolve } from '$app/paths';
	import { allLessons } from '#lib/koch/lessons.ts';
	import { app } from '#lib/state/app.svelte.ts';

	const lessons = allLessons();
	const current = $derived(app.data.progress.unlocked);
</script>

<svelte:head><title>Morse lernen</title></svelte:head>

<section class="hero">
	<h1>Morse lernen</h1>
	<p class="muted">
		Koch-Methode: Jede Lektion bringt ein neues Zeichen. Ab 90 % in deiner aktuellen Lektion wird die
		nächste frei. Alle freien Lektionen kannst du jederzeit wiederholen.
	</p>
	<div class="row">
		<a class="button primary" href={resolve('/training/[lesson]', { lesson: String(current) })}>
			Weiter mit Lektion {current}
		</a>
		<a class="button" href={resolve('/praxis')}>
			Problemzeichen üben{#if app.problems.length > 0}<span class="badge">{app.problems.length}</span>{/if}
		</a>
	</div>
</section>

<h2>Lektionen</h2>
<ol class="lessons">
	{#each lessons as lesson (lesson.number)}
		{@const unlocked = lesson.number <= current}
		{@const record = app.data.progress.lessons[lesson.number]}
		<li>
			{#if unlocked}
				<a class="lesson" class:current={lesson.number === current} href={resolve('/training/[lesson]', { lesson: String(lesson.number) })}>
					<span class="num">{lesson.number}</span>
					<span class="new mono" title="Neues Zeichen">{lesson.number === 1 ? 'KM' : lesson.newChar}</span>
					<span class="best muted">{record ? `${record.best} %` : '–'}</span>
				</a>
			{:else}
				<span class="lesson locked" aria-disabled="true" title="Noch gesperrt">
					<span class="num">{lesson.number}</span>
					<span class="new mono">{lesson.newChar}</span>
					<svg class="lock" viewBox="0 0 16 16" width="12" height="12" aria-label="gesperrt" role="img">
						<path fill="currentColor" d="M4.5 7V5a3.5 3.5 0 0 1 7 0v2h.5A1 1 0 0 1 13 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h.5Zm1.5 0h4V5a2 2 0 1 0-4 0v2Z" />
					</svg>
				</span>
			{/if}
		</li>
	{/each}
</ol>
<p class="muted small">Groß: das neue Zeichen der Lektion. Darunter: dein bestes Ergebnis.</p>

<style>
	.hero {
		margin-bottom: var(--space-6);
	}

	.badge {
		display: inline-grid;
		place-items: center;
		min-width: 22px;
		height: 22px;
		padding: 0 6px;
		border-radius: 11px;
		background: var(--danger-soft);
		color: var(--danger);
		font-size: 0.8rem;
	}

	.lessons {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
		gap: var(--space-2);
	}

	.lesson {
		display: grid;
		justify-items: center;
		gap: 2px;
		padding: var(--space-2) var(--space-1) var(--space-3);
		border-radius: var(--radius-s);
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		text-decoration: none;
	}

	a.lesson:hover {
		border-color: var(--accent);
	}

	.lesson.current {
		border-color: var(--accent);
		box-shadow: inset 0 0 0 1px var(--accent);
	}

	.lesson.locked {
		background: transparent;
		color: var(--muted);
		border-style: dashed;
	}

	.num {
		font-size: 0.75rem;
		color: var(--muted);
	}

	.new {
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1.2;
	}

	.best {
		font-size: 0.8rem;
	}

	.lock {
		margin: 3px 0 4px;
		opacity: 0.7;
	}

	.small {
		font-size: 0.875rem;
		margin-top: var(--space-3);
	}
</style>
