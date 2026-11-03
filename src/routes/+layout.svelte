<script lang="ts">
	import '../app.css';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { app } from '#lib/state/app.svelte.ts';
	import { applyTheme } from '#lib/state/theme.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	$effect(() => applyTheme(app.data.settings.theme));

	// Route ids each tab is active for.
	const links = [
		{ href: resolve('/'), label: 'Lernen', routes: ['/', '/training/[lesson]', '/praxis'] },
		{ href: resolve('/statistik'), label: 'Statistik', routes: ['/statistik'] },
		{ href: resolve('/uebersetzer'), label: 'Übersetzer', routes: ['/uebersetzer'] },
		{ href: resolve('/einstellungen'), label: 'Einstellungen', routes: ['/einstellungen'], icon: true }
	];
</script>

<header>
	<div class="bar">
		<a class="brand" href={resolve('/')} aria-label="Morse Trainer, Startseite">
			<span class="logo" aria-hidden="true"><i class="dash"></i><i class="dot"></i><i class="dash"></i></span>
			<span>Morse</span>
		</a>
		<nav aria-label="Hauptnavigation">
			{#each links as link (link.href)}
				<a href={link.href} aria-current={link.routes.includes(page.route.id ?? '') ? 'page' : undefined} aria-label={link.icon ? link.label : undefined}>
					{#if link.icon}
						<svg class="gear" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
							<path
								fill="none"
								stroke="currentColor"
								stroke-width="1.8"
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM19.4 13.5l1.6 1.2-2 3.4-1.9-.7a7.6 7.6 0 0 1-2 1.2L14.8 21h-4l-.3-2.1a7.6 7.6 0 0 1-2-1.2l-1.9.7-2-3.4 1.6-1.2a7.7 7.7 0 0 1 0-3l-1.6-1.2 2-3.4 1.9.7a7.6 7.6 0 0 1 2-1.2L10.8 3h4l.3 2.1a7.6 7.6 0 0 1 2 1.2l1.9-.7 2 3.4-1.6 1.2a7.7 7.7 0 0 1 0 3Z"
							/>
						</svg>
						<span class="label">{link.label}</span>
					{:else}
						{link.label}
					{/if}
				</a>
			{/each}
		</nav>
	</div>
</header>

<main>
	{#if !app.persistent}
		<p class="notice" role="status">
			Dein Fortschritt kann in diesem Browser nicht gespeichert werden (z. B. im privaten Modus). Üben
			funktioniert, aber nach dem Schließen ist der Stand weg. Mit dem Export in den
			<a href={resolve('/einstellungen')}>Einstellungen</a> kannst du ihn sichern.
		</p>
	{/if}
	{#if app.recovered}
		<p class="notice error" role="status">
			Gespeicherte Daten waren beschädigt und wurden beiseitegelegt. Die App startet mit einem neuen
			Stand.
		</p>
	{/if}
	{@render children()}
</main>

<style>
	header {
		position: sticky;
		top: 0;
		z-index: 10;
		background: color-mix(in srgb, var(--bg) 88%, transparent);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--border);
		padding-top: env(safe-area-inset-top);
	}

	.bar {
		max-width: var(--content);
		margin: 0 auto;
		padding: var(--space-2) var(--space-4);
		display: flex;
		align-items: center;
		gap: var(--space-4);
		justify-content: space-between;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-weight: 700;
		color: var(--text);
		text-decoration: none;
		letter-spacing: 0.02em;
	}

	.logo {
		display: inline-flex;
		align-items: center;
		gap: 3px;
	}

	.logo i {
		display: block;
		height: 6px;
		border-radius: 3px;
		background: var(--accent);
	}

	.logo .dash {
		width: 14px;
	}

	.logo .dot {
		width: 6px;
	}

	nav {
		display: flex;
		gap: var(--space-1);
		overflow-x: auto;
		scrollbar-width: none;
	}

	nav a {
		color: var(--muted);
		text-decoration: none;
		font-weight: 550;
		font-size: 0.95rem;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-s);
		white-space: nowrap;
	}

	nav a {
		display: inline-flex;
		align-items: center;
	}

	.gear {
		display: none;
	}

	nav a:hover {
		color: var(--text);
	}

	nav a[aria-current='page'] {
		color: var(--text);
		background: var(--surface-2);
	}

	main {
		max-width: var(--content);
		margin: 0 auto;
		padding: var(--space-5) var(--space-4) var(--space-7);
		padding-bottom: calc(var(--space-7) + env(safe-area-inset-bottom));
	}

	main > :global(.notice) {
		margin-bottom: var(--space-4);
	}

	@media (max-width: 560px) {
		.brand span:last-child {
			display: none;
		}

		.bar {
			gap: var(--space-2);
			padding-inline: var(--space-3);
		}

		nav a {
			padding: var(--space-2);
			font-size: 0.9rem;
		}

		.gear {
			display: block;
		}

		nav .label {
			display: none;
		}
	}
</style>
