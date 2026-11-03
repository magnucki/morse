import { describe, expect, it } from 'vitest';
import { resolveTheme } from './theme';

describe('theme', () => {
	it('follows the system for "system"', () => {
		expect(resolveTheme('system', true)).toBe('dark');
		expect(resolveTheme('system', false)).toBe('light');
	});

	it('lets a manual setting override the system', () => {
		expect(resolveTheme('light', true)).toBe('light');
		expect(resolveTheme('dark', false)).toBe('dark');
	});
});
