import { describe, expect, it } from 'vitest';
import { morseToText, textToMorse } from './translate';

describe('text to Morse', () => {
	it('separates characters by spaces and words by " / "', () => {
		expect(textToMorse('SOS HI').morse).toBe('... --- ... / .... ..');
	});

	it('treats lowercase like uppercase', () => {
		expect(textToMorse('sos')).toEqual(textToMorse('SOS'));
	});

	it('skips and reports unsupported characters', () => {
		expect(textToMorse('ÄB')).toEqual({ morse: '-...', unsupported: ['Ä'] });
	});

	it('translates punctuation', () => {
		expect(textToMorse('A?').morse).toBe('.- ..--..');
		expect(textToMorse('"@$').morse).toBe('.-..-. .--.-. ...-..-');
	});

	it('ignores extra whitespace', () => {
		expect(textToMorse('  E   E  ').morse).toBe('. / .');
		expect(textToMorse('').morse).toBe('');
	});
});

describe('Morse to text', () => {
	it('decodes characters and words', () => {
		expect(morseToText('.... .. / -.-').text).toBe('HI K');
	});

	it('accepts several spaces between characters', () => {
		expect(morseToText('....   ..').text).toBe('HI');
	});

	it('marks and reports unknown sequences', () => {
		const result = morseToText('...... .');
		expect(result.pieces).toEqual([
			{ kind: 'unknown', code: '......' },
			{ kind: 'char', char: 'E' }
		]);
		expect(result.unknown).toEqual(['......']);
	});

	it('accepts alternative dot and dash characters', () => {
		expect(morseToText('··· ___ ···').text).toBe('SOS');
		expect(morseToText('–·–').text).toBe('K');
	});

	it('ignores empty words', () => {
		expect(morseToText(' / . //  . ').text).toBe('E E');
	});
});
