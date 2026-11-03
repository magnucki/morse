import { decodeCode, encodeChar } from '../morse/code';

export interface TextToMorseResult {
	morse: string;
	/** Distinct characters that have no Morse code, in order of appearance. */
	unsupported: string[];
}

export function textToMorse(text: string): TextToMorseResult {
	const unsupported: string[] = [];
	const words = text
		.trim()
		.split(/\s+/)
		.map((word) =>
			[...word]
				.map((char) => {
					const code = encodeChar(char);
					if (!code && !unsupported.includes(char)) unsupported.push(char);
					return code;
				})
				.filter(Boolean)
				.join(' ')
		)
		.filter((word) => word.length > 0);
	return { morse: words.join(' / '), unsupported };
}

export type DecodedPiece = { kind: 'char'; char: string } | { kind: 'unknown'; code: string } | { kind: 'space' };

export interface MorseToTextResult {
	pieces: DecodedPiece[];
	/** Plain text, with "?" for unknown sequences. */
	text: string;
	/** Distinct unknown sequences, in order of appearance. */
	unknown: string[];
}

/** Accepts "." / "·" for dots and "-" / "_" / "–" for dashes; spaces separate characters, "/" words. */
export function morseToText(input: string): MorseToTextResult {
	const normalized = input.replace(/[·•]/g, '.').replace(/[_–—]/g, '-');
	const pieces: DecodedPiece[] = [];
	const unknown: string[] = [];
	const words = normalized.split('/').map((w) => w.trim().split(/\s+/).filter(Boolean));
	words
		.filter((codes) => codes.length > 0)
		.forEach((codes, i) => {
			if (i > 0) pieces.push({ kind: 'space' });
			for (const code of codes) {
				const char = decodeCode(code);
				if (char) {
					pieces.push({ kind: 'char', char });
				} else {
					pieces.push({ kind: 'unknown', code });
					if (!unknown.includes(code)) unknown.push(code);
				}
			}
		});
	const text = pieces
		.map((p) => (p.kind === 'char' ? p.char : p.kind === 'space' ? ' ' : '?'))
		.join('');
	return { pieces, text, unknown };
}
