export type AlignOp =
	| { kind: 'match'; sent: string; sentIndex: number }
	| { kind: 'substitute'; sent: string; typed: string; sentIndex: number }
	| { kind: 'omit'; sent: string; sentIndex: number }
	/** sentIndex is the index of the sent character the extra one was typed before. */
	| { kind: 'extra'; typed: string; sentIndex: number };

export interface Evaluation {
	ops: AlignOp[];
	sentCount: number;
	correct: number;
	confused: number;
	omitted: number;
	extra: number;
	/** correct / (sent + extra), between 0 and 1. */
	ratio: number;
	/** Whole-number percentage, rounded down so that 90% always means the threshold is met. */
	percent: number;
}

/** Uppercase and drop all whitespace. */
export function normalize(text: string): string {
	return text.replace(/\s+/g, '').toUpperCase();
}

/**
 * Aligns the copy with the sent text using a Levenshtein table. On equally short
 * paths the backtrace prefers match, then substitution, then omission, then extra.
 */
export function align(sentText: string, copyText: string): AlignOp[] {
	const sent = [...normalize(sentText)];
	const copy = [...normalize(copyText)];
	const n = sent.length;
	const m = copy.length;
	const d: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
	for (let i = 0; i <= n; i++) d[i][0] = i;
	for (let j = 0; j <= m; j++) d[0][j] = j;
	for (let i = 1; i <= n; i++) {
		for (let j = 1; j <= m; j++) {
			const cost = sent[i - 1] === copy[j - 1] ? 0 : 1;
			d[i][j] = Math.min(d[i - 1][j - 1] + cost, d[i - 1][j] + 1, d[i][j - 1] + 1);
		}
	}

	const ops: AlignOp[] = [];
	let i = n;
	let j = m;
	while (i > 0 || j > 0) {
		if (i > 0 && j > 0 && sent[i - 1] === copy[j - 1] && d[i][j] === d[i - 1][j - 1]) {
			ops.push({ kind: 'match', sent: sent[i - 1], sentIndex: i - 1 });
			i--;
			j--;
		} else if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + 1) {
			ops.push({ kind: 'substitute', sent: sent[i - 1], typed: copy[j - 1], sentIndex: i - 1 });
			i--;
			j--;
		} else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
			ops.push({ kind: 'omit', sent: sent[i - 1], sentIndex: i - 1 });
			i--;
		} else {
			ops.push({ kind: 'extra', typed: copy[j - 1], sentIndex: i });
			j--;
		}
	}
	return ops.reverse();
}

export function evaluate(sentText: string, copyText: string): Evaluation {
	const ops = align(sentText, copyText);
	const count = (kind: AlignOp['kind']) => ops.filter((op) => op.kind === kind).length;
	const correct = count('match');
	const confused = count('substitute');
	const omitted = count('omit');
	const extra = count('extra');
	const sentCount = correct + confused + omitted;
	const denominator = sentCount + extra;
	const ratio = denominator === 0 ? 0 : correct / denominator;
	return {
		ops,
		sentCount,
		correct,
		confused,
		omitted,
		extra,
		ratio,
		percent: Math.floor(ratio * 100 + 1e-9)
	};
}
