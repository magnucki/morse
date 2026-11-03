<script lang="ts">
	import { isIOSDevice } from '../audio/ios';

	const show = isIOSDevice();
</script>

{#if show}
	<p class="hint muted">
		Kein Ton? Auf dem iPhone und iPad schaltet der Lautlos-Schalter auch die App stumm.
	</p>
{/if}

<style>
	.hint {
		font-size: 0.875rem;
		margin: var(--space-2) 0 0;
	}
</style>
