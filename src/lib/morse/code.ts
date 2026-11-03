/** International Morse code for every character the app knows. Keys are uppercase. */
export const MORSE_CODE: Readonly<Record<string, string>> = {
	A: '.-',
	B: '-...',
	C: '-.-.',
	D: '-..',
	E: '.',
	F: '..-.',
	G: '--.',
	H: '....',
	I: '..',
	J: '.---',
	K: '-.-',
	L: '.-..',
	M: '--',
	N: '-.',
	O: '---',
	P: '.--.',
	Q: '--.-',
	R: '.-.',
	S: '...',
	T: '-',
	U: '..-',
	V: '...-',
	W: '.--',
	X: '-..-',
	Y: '-.--',
	Z: '--..',
	'0': '-----',
	'1': '.----',
	'2': '..---',
	'3': '...--',
	'4': '....-',
	'5': '.....',
	'6': '-....',
	'7': '--...',
	'8': '---..',
	'9': '----.',
	'.': '.-.-.-',
	',': '--..--',
	'?': '..--..',
	'/': '-..-.',
	'=': '-...-',
	"'": '.----.',
	'!': '-.-.--',
	'(': '-.--.',
	')': '-.--.-',
	'&': '.-...',
	':': '---...',
	';': '-.-.-.',
	'+': '.-.-.',
	'-': '-....-',
	_: '..--.-',
	'"': '.-..-.',
	$: '...-..-',
	'@': '.--.-.'
};

const DECODE: ReadonlyMap<string, string> = new Map(
	Object.entries(MORSE_CODE).map(([char, code]) => [code, char])
);

/** Morse code of a character (case-insensitive), or undefined if unsupported. */
export function encodeChar(char: string): string | undefined {
	return MORSE_CODE[char.toUpperCase()];
}

/** Character for a dot/dash sequence, or undefined if unknown. */
export function decodeCode(code: string): string | undefined {
	return DECODE.get(code);
}
