import { afterEach, describe, expect, it } from 'vitest';
import { MorsePlayer } from './player';
import { buildSchedule } from '../timing/schedule';

type Call = [string, ...number[]];

/** Records gain automation and oscillator calls instead of producing sound. */
class FakeAudioContext {
	static last: FakeAudioContext;
	currentTime = 0;
	state = 'running';
	destination = {};
	gainCalls: Call[] = [];
	oscCalls: Call[] = [];
	oscillators: { onended: (() => void) | null }[] = [];

	constructor() {
		FakeAudioContext.last = this;
	}

	resume() {
		return Promise.resolve();
	}

	createOscillator() {
		const ctx = this;
		const osc = {
			type: '',
			frequency: { value: 0 },
			onended: null as (() => void) | null,
			connect: (node: unknown) => node,
			disconnect() {},
			start: (t: number) => ctx.oscCalls.push(['start', t]),
			stop: (t?: number) => ctx.oscCalls.push(['stop', t ?? ctx.currentTime])
		};
		this.oscillators.push(osc);
		return osc;
	}

	createGain() {
		const ctx = this;
		const record =
			(name: string) =>
			(...args: number[]) =>
				ctx.gainCalls.push([name, ...args]);
		return {
			gain: {
				value: 0.5,
				setValueAtTime: record('set'),
				linearRampToValueAtTime: record('ramp'),
				cancelScheduledValues: record('cancel')
			},
			connect: (node: unknown) => node,
			disconnect() {}
		};
	}
}

(globalThis as unknown as { window: unknown }).window = { AudioContext: FakeAudioContext };

const speed = { charWpm: 20, effectiveWpm: 20 };

describe('player', () => {
	afterEach(() => {
		FakeAudioContext.last.gainCalls = [];
		FakeAudioContext.last.oscCalls = [];
	});

	it('plans each element with short ramps on the audio clock', () => {
		const player = new MorsePlayer();
		player.play(buildSchedule('E', speed), 600);
		const ctx = FakeAudioContext.last;
		const [start] = ctx.oscCalls;
		const t0 = start[1];
		// one dot: silent at start, ramp up, hold, ramp down to 0 at start + 60 ms
		expect(ctx.gainCalls).toContainEqual(['ramp', 0.5, t0 + 0.005]);
		expect(ctx.gainCalls).toContainEqual(['ramp', 0, t0 + 0.06]);
	});

	it('starts the first tone leadMs after now, with a negative position before it', () => {
		const player = new MorsePlayer();
		player.unlock();
		const ctx = FakeAudioContext.last;
		ctx.currentTime = 2;
		const playback = player.play(buildSchedule('E', speed), 600, 3100);
		const start = ctx.oscCalls.find((c) => c[0] === 'start')!;
		expect(start[1]).toBeCloseTo(5.1, 6);
		expect(playback.position()).toBeCloseTo(-3100, 3);
		ctx.currentTime = 5.1;
		expect(playback.position()).toBeCloseTo(0, 3);
		ctx.currentTime = 0;
		const dflt = player.play(buildSchedule('E', speed), 600);
		expect(dflt.position()).toBeCloseTo(-100, 3);
	});

	it('fades out on stop instead of cutting the tone', () => {
		const player = new MorsePlayer();
		const playback = player.play(buildSchedule('T', speed), 600);
		const ctx = FakeAudioContext.last;
		ctx.currentTime = 0.2;
		ctx.gainCalls = [];
		playback.stop();
		expect(ctx.gainCalls.slice(0, 2)).toEqual([
			['cancel', 0.2],
			['set', 0.5, 0.2]
		]);
		const [name, value, time] = ctx.gainCalls[2];
		expect([name, value]).toEqual(['ramp', 0]);
		expect(time).toBeCloseTo(0.205, 6);
		expect(ctx.oscCalls.at(-1)?.[0]).toBe('stop');
		expect(playback.running).toBe(false);
	});

	it('stops the previous playback when a new one starts', async () => {
		const player = new MorsePlayer();
		const first = player.play(buildSchedule('T', speed), 600);
		player.play(buildSchedule('E', speed), 600);
		expect(first.running).toBe(false);
		await expect(first.ended).resolves.toBeUndefined();
	});
});
