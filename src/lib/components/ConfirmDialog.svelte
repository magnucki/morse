<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		confirmLabel: string;
		danger?: boolean;
		children: Snippet;
	}

	let { title, confirmLabel, danger = false, children }: Props = $props();

	let dialog: HTMLDialogElement;
	let resolver: ((ok: boolean) => void) | null = null;

	/** Opens the dialog and resolves with the learner's choice. */
	export function ask(): Promise<boolean> {
		dialog.showModal();
		return new Promise((resolve) => (resolver = resolve));
	}

	function close(ok: boolean) {
		dialog.close();
		resolver?.(ok);
		resolver = null;
	}
</script>

<dialog bind:this={dialog} oncancel={() => close(false)} aria-labelledby="confirm-title">
	<h2 id="confirm-title">{title}</h2>
	<div class="body">{@render children()}</div>
	<div class="row actions">
		<button type="button" onclick={() => close(false)}>Abbrechen</button>
		<button type="button" class={danger ? 'primary danger-fill' : 'primary'} onclick={() => close(true)}>
			{confirmLabel}
		</button>
	</div>
</dialog>

<style>
	dialog {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--text);
		padding: var(--space-5);
		max-width: min(440px, calc(100vw - 32px));
	}

	dialog::backdrop {
		background: rgb(0 0 0 / 0.45);
	}

	.body {
		color: var(--muted);
	}

	.actions {
		justify-content: flex-end;
		margin-top: var(--space-5);
	}

	.danger-fill {
		background: var(--danger);
		border-color: var(--danger);
		color: var(--surface);
	}
</style>
