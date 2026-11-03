import { describe, expect, it } from 'vitest';
import { decodeCode, encodeChar, MORSE_CODE } from './code';
import { KOCH_ORDER } from '../koch/lessons';

describe('morse code table', () => {
	it('encodes letters case-insensitively', () => {
		expect(encodeChar('K')).toBe('-.-');
		expect(encodeChar('s')).toBe('...');
	});

	it('encodes digits and punctuation', () => {
		expect(encodeChar('5')).toBe('.....');
		expect(encodeChar('0')).toBe('-----');
		expect(encodeChar('?')).toBe('..--..');
		expect(encodeChar('/')).toBe('-..-.');
		expect(encodeChar('=')).toBe('-...-');
	});

	it('returns undefined for unsupported characters', () => {
		expect(encodeChar('Ä')).toBeUndefined();
	});

	it('decodes codes back to characters', () => {
		expect(decodeCode('.-.-.-')).toBe('.');
		expect(decodeCode('......')).toBeUndefined();
	});

	it('has unique codes', () => {
		const codes = Object.values(MORSE_CODE);
		expect(new Set(codes).size).toBe(codes.length);
	});

	it('covers every Koch character', () => {
		for (const char of KOCH_ORDER) expect(encodeChar(char)).toBeDefined();
	});
});
