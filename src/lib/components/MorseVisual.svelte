<script lang="ts">
	import type { Playback } from '../audio/player';
	import type { Schedule } from '../timing/schedule';

	interface Props {
		/** The played text; each supported character gets its own cluster of bars. */
		text: string;
		schedule: Schedule;
		/** While running, the current element is highlighted. */
		playback?: Playback | null;
		size?: 'normal' | 'large';
		/** Show the character under its bars. */
		labels?: boolean;
	}

	let { text, schedule, playback = null, size = 'normal', labels = true }: Props = $props();

	let active = $state(-1);

	const clusters = $derived.by(() => {
		const chars = [...text];
		const byChar = new Map<number, { index: number; kind: 'dot' | 'dash' }[]>();
		schedule.segments.forEach((segment, index) => {
			const list = byChar.get(segment.charIndex) ?? [];
			list.push({ index, kind: segment.kind });
			byChar.set(segment.charIndex, list);
		});
		const result: { char: string; elements: { index: number; kind: 'dot' | 'dash' }[]; wordStart: boolean }[] = [];
		let pendingSpace = false;
		chars.forEach((char, i) => {
			if (/\s/.test(char)) {
				pendingSpace = result.length > 0;
				return;
			}
			const elements = byChar.get(i);
			if (!elements) return;
			result.push({ char: char.toUpperCase(), elements, wordStart: pendingSpace });
			pendingSpace = false;
		});
		return result;
	});

	$effect(() => {
		if (!playback) {
			active = -1;
			return;
		}
		const current = playback;
		let frame = 0;
		const tick = () => {
			const t = current.position();
			active = schedule.segments.findIndex((s) => t >= s.start && t < s.start + s.duration);
			if (current.running) frame = requestAnimationFrame(tick);
			else active = -1;
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	});
</script>

<div class="visual {size}" aria-hidden="true">
	{#each clusters as cluster, i (i)}
		<div class="cluster" class:word-start={cluster.wordStart}>
			<div class="bars">
				{#each cluster.elements as element (element.index)}
					<span class="el {element.kind}" class:active={element.index === active}></span>
				{/each}
			</div>
			{#if labels}<span class="char mono">{cluster.char}</span>{/if}
		</div>
	{/each}
</div>

<style>
	.visual {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3) var(--space-4);
		align-items: flex-end;
	}

	.cluster {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
	}

	.cluster.word-start {
		margin-left: var(--space-4);
	}

	.bars {
		display: flex;
		gap: 4px;
		align-items: center;
		height: 12px;
	}

	.el {
		display: block;
		height: 8px;
		border-radius: 4px;
		background: var(--border);
		transition: background-color 0.04s, transform 0.04s;
	}

	.dot {
		width: 8px;
	}

	.dash {
		width: 24px;
	}

	.el.active {
		background: var(--accent);
		transform: scaleY(1.5);
	}

	.char {
		font-size: 0.8rem;
		color: var(--muted);
	}

	.large .bars {
		height: 20px;
		gap: 6px;
	}

	.large .el {
		height: 12px;
		border-radius: 6px;
	}

	.large .dot {
		width: 12px;
	}

	.large .dash {
		width: 40px;
	}

	.large .char {
		font-size: 1.1rem;
		color: var(--text);
	}

	@media (prefers-reduced-motion: reduce) {
		.el.active {
			background: var(--border);
			transform: none;
		}
	}
</style>
