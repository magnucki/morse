import { describe, expect, it } from 'vitest';
import { align, evaluate } from './align';

const kinds = (sent: string, copy: string) => align(sent, copy).map((op) => op.kind);

describe('alignment', () => {
	it('ignores case and spacing', () => {
		const result = evaluate('KMUKM MMKUK', 'kmukmmm kuk');
		expect(result.correct).toBe(10);
		expect(result.percent).toBe(100);
	});

	it('detects a confusion', () => {
		const ops = align('KMSUR', 'KMHUR');
		expect(ops[2]).toEqual({ kind: 'substitute', sent: 'S', typed: 'H', sentIndex: 2 });
		expect(kinds('KMSUR', 'KMHUR')).toEqual(['match', 'match', 'substitute', 'match', 'match']);
	});

	it('detects an omission without shifting the rest', () => {
		expect(kinds('KMSUR', 'KMUR')).toEqual(['match', 'match', 'omit', 'match', 'match']);
		expect(align('KMSUR', 'KMUR')[2]).toMatchObject({ kind: 'omit', sent: 'S' });
	});

	it('detects an extra character without shifting the rest', () => {
		const ops = align('KMSUR', 'KMSSUR');
		expect(ops.filter((op) => op.kind === 'extra')).toHaveLength(1);
		expect(ops.filter((op) => op.kind === 'match')).toHaveLength(5);
	});

	it('scores an empty copy as all omitted', () => {
		const result = evaluate('KMSUR', '');
		expect(result.omitted).toBe(5);
		expect(result.percent).toBe(0);
	});

	it('keeps sent indices in order for every sent character', () => {
		const ops = align('ABCDE FGHIJ', 'ABXDE FHHIJJ');
		const indices = ops.filter((op) => op.kind !== 'extra').map((op) => op.sentIndex);
		expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
	});

	it('handles typical copying errors in the middle of a long text', () => {
		const sent = 'KMURE SNAPT LWIKM';
		const copy = 'KMURE SNPT LWWIKM';
		expect(evaluate(sent, copy)).toMatchObject({ correct: 14, omitted: 1, extra: 1, confused: 0 });
	});
});

describe('score', () => {
	it('computes 45 / 51 as 88%', () => {
		// 50 sent: 45 correct, 3 confused, 2 omitted, plus 1 extra
		const sent = 'KMKMK'.repeat(10);
		const chars = [...sent];
		const copy = [...chars];
		copy[5] = 'X';
		copy[15] = 'X';
		copy[25] = 'X';
		copy.splice(40, 1); // omit index 40
		copy.splice(44, 1); // omit original index 45
		copy.push('X'); // extra at the end
		const result = evaluate(sent, copy.join(''));
		expect(result).toMatchObject({ correct: 45, confused: 3, omitted: 2, extra: 1 });
		expect(result.percent).toBe(88);
	});

	it('rounds down so that 90% means the threshold is met', () => {
		const sent = 'K'.repeat(1000);
		const copy = 'K'.repeat(899) + 'M'.repeat(101);
		expect(evaluate(sent, copy).percent).toBe(89);
		expect(evaluate('K'.repeat(10), 'K'.repeat(9) + 'M').percent).toBe(90);
	});
});
