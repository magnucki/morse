import type { AlignOp } from '../align/align';
import { charsUpTo } from '../koch/lessons';
import { defaultData, type AppData, type Settings } from '../storage/schema';
import { browserStorage, createStore } from '../storage/storage';
import { recordLessonResult } from '../stats/progress';
import { problemChars, recordOps } from '../stats/stats';

const store = createStore(browserStorage);

class AppState {
	data = $state<AppData>(defaultData());
	/** False when progress cannot be saved on this device. */
	persistent = $state(true);
	/** True when stored data was unreadable and has been set aside. */
	recovered = $state(false);

	unlockedChars = $derived(charsUpTo(this.data.progress.unlocked));
	problems = $derived(problemChars(this.data.stats, this.unlockedChars));

	constructor() {
		const result = store.load();
		this.data = result.data;
		this.persistent = result.persistent;
		this.recovered = result.recovered;
	}

	private commit(next: AppData) {
		this.data = next;
		this.persistent = store.save($state.snapshot(next) as AppData) && store.persistent;
	}

	updateSettings(patch: Partial<Settings>) {
		const settings = { ...this.data.settings, ...patch };
		settings.effectiveWpm = Math.min(settings.effectiveWpm, settings.charWpm);
		this.commit({ ...this.data, settings });
	}

	/** Records a lesson exercise; returns the newly unlocked lesson, if any. */
	recordLesson(lesson: number, ops: AlignOp[], ratio: number, percent: number): number | null {
		const { progress, unlockedLesson } = recordLessonResult(this.data.progress, lesson, ratio, percent);
		this.commit({ ...this.data, progress, stats: recordOps(this.data.stats, ops) });
		return unlockedLesson;
	}

	/** Targeted practice only feeds the statistics. */
	recordPractice(ops: AlignOp[]) {
		this.commit({ ...this.data, stats: recordOps(this.data.stats, ops) });
	}

	/** Clears progress and statistics, keeps the settings. */
	reset() {
		this.commit({ ...defaultData(), settings: this.data.settings });
	}

	replace(data: AppData) {
		this.commit(data);
	}
}

export const app = new AppState();
