import {
	isFunction,
	isFunctionParamWithMeta,
	isMixin,
	isToken,
} from '@arbor-css/core';
import type { TokenMap } from './tokenProvider.js';

export interface FunctionParamError {
	start: number;
	end: number;
	message: string;
}

/** Extract bare literal values from a CSS syntax string, ignoring `<type>` tokens. */
export function parseLiteralsFromSyntax(syntax: string): string[] {
	return syntax
		.split('|')
		.map((s) => s.trim())
		.filter((s) => s.length > 0 && !s.startsWith('<') && s !== '*');
}

/**
 * Scans a single CSS line for complete Arbor function/mixin calls and returns
 * errors for any arguments whose parameter has a literal-only syntax but the
 * supplied value isn't one of the allowed literals.
 */
export function findFunctionParamErrors(
	line: string,
	tokenMap: TokenMap,
): FunctionParamError[] {
	const errors: FunctionParamError[] = [];
	const callRegex = /(--[\w-]+)\(/g;
	let match: RegExpExecArray | null;

	while ((match = callRegex.exec(line)) !== null) {
		const funcName = match[1];
		const openParenIdx = match.index + funcName.length;

		// Find the matching closing paren — skip unclosed calls (user still typing)
		let depth = 1;
		let i = openParenIdx + 1;
		while (i < line.length && depth > 0) {
			if (line[i] === '(') depth++;
			else if (line[i] === ')') depth--;
			i++;
		}
		if (depth !== 0) continue;

		const argsText = line.slice(openParenIdx + 1, i - 1);
		const value = tokenMap.get(funcName);
		if (!value || (!isFunction(value) && !isMixin(value))) continue;

		const params = value.parameters ?? [];
		const args = parseTopLevelArgs(argsText, openParenIdx + 1);

		for (let argIdx = 0; argIdx < args.length; argIdx++) {
			const param = params[argIdx];
			if (!param) continue;

			let syntax: string | undefined;
			let paramLabel: string;
			if (isFunctionParamWithMeta(param)) {
				syntax = param.syntax ?? param.type;
				paramLabel = param.name;
			} else if (isToken(param)) {
				syntax = param.syntax;
				paramLabel = param.name;
			} else {
				paramLabel = param;
			}
			if (!syntax) continue;

			const literals = parseLiteralsFromSyntax(syntax);
			if (!literals.length) continue;

			const { value: argValue, start, end } = args[argIdx];
			if (!argValue) continue;

			// Skip token references and complex expressions — only validate plain identifiers
			if (
				argValue.startsWith('-') ||
				argValue.includes('(') ||
				/\s/.test(argValue)
			) {
				continue;
			}

			if (!literals.includes(argValue)) {
				errors.push({
					start,
					end,
					message: `Invalid value "${argValue}" for ${paramLabel}. Allowed: ${literals.join(' | ')}`,
				});
			}
		}
	}

	return errors;
}

function parseTopLevelArgs(
	argsText: string,
	offset: number,
): Array<{ value: string; start: number; end: number }> {
	const result: Array<{ value: string; start: number; end: number }> = [];
	let depth = 0;
	let argStart = 0;

	for (let i = 0; i <= argsText.length; i++) {
		const c = i < argsText.length ? argsText[i] : ','; // sentinel
		if (c === '(') depth++;
		else if (c === ')') depth--;
		else if (c === ',' && depth === 0) {
			const raw = argsText.slice(argStart, i);
			const leadingSpaces = raw.length - raw.trimStart().length;
			const value = raw.trim();
			result.push({
				value,
				start: offset + argStart + leadingSpaces,
				end: offset + argStart + leadingSpaces + value.length,
			});
			argStart = i + 1;
		}
	}

	return result;
}
