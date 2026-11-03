import type { Schedule } from '../timing/schedule';

/** Ramp at each tone edge, avoids clicks. */
const RAMP_S = 0.005;
/** Lead time so the first tone is never scheduled in the past. */
const LEAD_S = 0.1;
const VOLUME = 0.5;

export interface Playback {
	schedule: Schedule;
	/** Position in ms since the first tone; negative before it starts. */
	position(): number;
	stop(): void;
	/** Resolves when playback ends or is stopped. */
	readonly ended: Promise<void>;
	readonly running: boolean;
}

type AudioContextConstructor = typeof AudioContext;

/**
 * Plays tone schedules with Web Audio. All tones are planned ahead on the audio
 * clock, so UI work never changes the timing.
 */
export class MorsePlayer {
	private ctx: AudioContext | null = null;
	private current: Playback | null = null;

	/** Creates or resumes the audio context. Call this inside a click handler (iOS). */
	unlock(): AudioContext {
		if (!this.ctx) {
			const Ctor: AudioContextConstructor =
				window.AudioContext ??
				(window as unknown as { webkitAudioContext: AudioContextConstructor }).webkitAudioContext;
			this.ctx = new Ctor();
		}
		if (this.ctx.state !== 'running') void this.ctx.resume();
		return this.ctx;
	}

	stop(): void {
		this.current?.stop();
		this.current = null;
	}

	play(schedule: Schedule, toneHz: number): Playback {
		this.stop();
		const ctx = this.unlock();
		const t0 = ctx.currentTime + LEAD_S;
		const end = t0 + schedule.duration / 1000;

		const osc = ctx.createOscillator();
		osc.type = 'sine';
		osc.frequency.value = toneHz;
		const gain = ctx.createGain();
		gain.gain.setValueAtTime(0, ctx.currentTime);
		for (const { start, duration } of schedule.segments) {
			const a = t0 + start / 1000;
			const b = a + duration / 1000;
			const ramp = Math.min(RAMP_S, duration / 1000 / 3);
			gain.gain.setValueAtTime(0, a);
			gain.gain.linearRampToValueAtTime(VOLUME, a + ramp);
			gain.gain.setValueAtTime(VOLUME, b - ramp);
			gain.gain.linearRampToValueAtTime(0, b);
		}
		osc.connect(gain).connect(ctx.destination);
		osc.start(t0);
		osc.stop(end + 0.05);

		let running = true;
		let resolveEnded!: () => void;
		const ended = new Promise<void>((resolve) => (resolveEnded = resolve));
		const finish = () => {
			if (!running) return;
			running = false;
			resolveEnded();
		};
		osc.onended = () => {
			finish();
			osc.disconnect();
			gain.disconnect();
		};

		const playback: Playback = {
			schedule,
			position: () => (ctx.currentTime - t0) * 1000,
			stop: () => {
				if (!running) return;
				// Fade out instead of cutting, which would click.
				const now = ctx.currentTime;
				gain.gain.cancelScheduledValues(now);
				gain.gain.setValueAtTime(gain.gain.value, now);
				gain.gain.linearRampToValueAtTime(0, now + RAMP_S);
				try {
					osc.stop(now + RAMP_S + 0.01);
				} catch {
					// already stopped
				}
				finish();
			},
			ended,
			get running() {
				return running;
			}
		};
		this.current = playback;
		return playback;
	}
}

export const player = new MorsePlayer();
