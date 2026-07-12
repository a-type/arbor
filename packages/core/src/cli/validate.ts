import {
	createPrefixValidationConfig,
	createTokenMap,
	findInvalidTokenMatches,
	formatInvalidTokenMatchMessage,
	type PrefixValidationConfig,
	type TokenMap,
} from '../util/tokenValidation.js';

export interface ValidationIssue {
	name: string;
	kind: 'token' | 'function' | 'mixin';
	message: string;
	index: number;
	line: number;
	column: number;
}

function getLineStarts(content: string): number[] {
	const lineStarts = [0];
	for (let i = 0; i < content.length; i += 1) {
		if (content[i] === '\n') {
			lineStarts.push(i + 1);
		}
	}
	return lineStarts;
}

function indexToLineColumn(
	index: number,
	lineStarts: number[],
): { line: number; column: number } {
	let low = 0;
	let high = lineStarts.length - 1;
	while (low <= high) {
		const mid = Math.floor((low + high) / 2);
		const lineStart = lineStarts[mid];
		const nextLineStart =
			mid + 1 < lineStarts.length ?
				lineStarts[mid + 1]
			:	Number.POSITIVE_INFINITY;
		if (index < lineStart) {
			high = mid - 1;
			continue;
		}
		if (index >= nextLineStart) {
			low = mid + 1;
			continue;
		}
		return {
			line: mid + 1,
			column: index - lineStart + 1,
		};
	}

	return {
		line: 1,
		column: index + 1,
	};
}

function addIssue(
	issues: ValidationIssue[],
	seen: Set<string>,
	lineStarts: number[],
	{
		name,
		kind,
		message,
		index,
	}: {
		name: string;
		kind: ValidationIssue['kind'];
		message: string;
		index: number;
	},
) {
	const key = `${kind}:${name}:${index}:${message}`;
	if (seen.has(key)) {
		return;
	}
	seen.add(key);
	const { line, column } = indexToLineColumn(index, lineStarts);
	issues.push({
		name,
		kind,
		message,
		index,
		line,
		column,
	});
}

export { createPrefixValidationConfig, createTokenMap };

export function validateCssContent({
	content,
	tokenMap,
	prefixConfig,
}: {
	content: string;
	tokenMap: TokenMap;
	prefixConfig: PrefixValidationConfig;
}): ValidationIssue[] {
	const issues: ValidationIssue[] = [];
	const seen = new Set<string>();
	const lineStarts = getLineStarts(content);

	for (const match of findInvalidTokenMatches({
		content,
		tokenMap,
		prefixConfig,
	})) {
		addIssue(issues, seen, lineStarts, {
			name: match.name,
			kind: match.kind,
			message: formatInvalidTokenMatchMessage(match),
			index: match.index,
		});
	}

	return issues;
}
