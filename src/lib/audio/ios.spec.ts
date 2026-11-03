import { describe, expect, it } from 'vitest';
import { isIOS } from './ios';

describe('iOS detection', () => {
	it('detects an iPhone', () => {
		const ua =
			'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
		expect(isIOS(ua, 5)).toBe(true);
	});

	it('detects an iPad with a desktop user agent by its touch points', () => {
		const ua =
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
		expect(isIOS(ua, 5)).toBe(true);
	});

	it('does not flag a Mac', () => {
		const ua =
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
		expect(isIOS(ua, 0)).toBe(false);
	});

	it('does not flag desktop or Android browsers', () => {
		expect(isIOS('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140.0 Safari/537.36', 0)).toBe(false);
		expect(isIOS('Mozilla/5.0 (Linux; Android 15; Pixel 9) Chrome/140.0 Mobile Safari/537.36', 5)).toBe(false);
	});
});
