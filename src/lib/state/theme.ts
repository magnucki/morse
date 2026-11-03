import type { ThemeSetting } from '../storage/schema';

const query = () => matchMedia('(prefers-color-scheme: dark)');

export function resolveTheme(setting: ThemeSetting, systemDark: boolean): 'light' | 'dark' {
	if (setting === 'system') return systemDark ? 'dark' : 'light';
	return setting;
}

/**
 * Applies the theme to <html> and, for "system", follows OS changes until the
 * returned cleanup function is called.
 */
export function applyTheme(setting: ThemeSetting): () => void {
	const mq = query();
	const update = () => {
		document.documentElement.dataset.theme = resolveTheme(setting, mq.matches);
	};
	update();
	if (setting !== 'system') return () => {};
	mq.addEventListener('change', update);
	return () => mq.removeEventListener('change', update);
}
