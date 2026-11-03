/** iPhone, iPod and iPad (which reports a desktop "Macintosh" user agent but has touch). */
export function isIOS(userAgent: string, maxTouchPoints: number): boolean {
	return /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1);
}

export function isIOSDevice(): boolean {
	return typeof navigator !== 'undefined' && isIOS(navigator.userAgent, navigator.maxTouchPoints ?? 0);
}
