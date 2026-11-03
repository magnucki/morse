import { parseAppData, type AppData } from './schema';

/** For example `morse-trainer-2026-11-02.json`, using the local date. */
export function exportFileName(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `morse-trainer-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`;
}

export function serialize(data: AppData): string {
	return JSON.stringify(data, null, 2);
}

/** Parses an export file. Throws InvalidDataError (or SyntaxError) for anything that is not a valid export. */
export function parseExport(text: string): AppData {
	return parseAppData(JSON.parse(text));
}

/** Starts a download of the data as a JSON file (browser only). */
export function downloadExport(data: AppData, now = new Date()): void {
	const blob = new Blob([serialize(data)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = exportFileName(now);
	document.body.append(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
