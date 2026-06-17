import { isToken, Token } from '@arbor-css/tokens';
import { isSingleValue } from './util.js';

export interface Css {
	text: string;
	tokens: Token[];
	_isCssBrand: true;
	type: 'value' | 'stylesheet';
}

export function isCss(value: any): value is Css {
	return (
		value &&
		typeof value === 'object' &&
		typeof value.text === 'string' &&
		Array.isArray(value.tokens) &&
		value.tokens.every(isToken) &&
		'_isCssBrand' in value
	);
}

export type TokenFallbackInterpolation = [Token, CssInterpolation];
export type CssInterpolation =
	| string
	| number
	| Token
	| TokenFallbackInterpolation
	| Css
	| Css[];

export function isTokenFallbackInterpolation(
	value: CssInterpolation,
): value is TokenFallbackInterpolation {
	return (
		Array.isArray(value) &&
		value.length === 2 &&
		isToken(value[0]) &&
		(typeof value[1] === 'string' ||
			typeof value[1] === 'number' ||
			isToken(value[1]) ||
			isCss(value[1]))
	);
}

export function isCssInterpolation(value: any): value is CssInterpolation {
	return (
		typeof value === 'string' ||
		typeof value === 'number' ||
		isToken(value) ||
		isCss(value) ||
		(isTokenFallbackInterpolation(value) as any) ||
		(Array.isArray(value) &&
			value.every(
				(v) =>
					typeof v === 'string' ||
					typeof v === 'number' ||
					isToken(v) ||
					isCss(v),
			))
	);
}

/**
 * Constructs a CSS value from a string template. Include other
 * values by interpolating them with ${...}. Interpolated tokens
 * will be tracked.
 */
export function css(
	strings: TemplateStringsArray,
	...values: CssInterpolation[]
): Css {
	let text = '';
	const tokens: Token[] = [];
	strings.forEach((str, i) => {
		text += str;
		if (i < values.length) {
			const value = values[i];

			if (typeof value === 'number' && isNaN(value)) {
				throw new Error(
					`Invalid CSS interpolation value: ${value} (preceded by ${text}...)`,
				);
			}

			// lookahead past whitespace for next meaningful token char
			const nextTokenMatch = /\S/.exec(strings[i + 1]);
			const nextTokenChar = nextTokenMatch ? nextTokenMatch[0] : '';
			text += resolveInterpolation(value, tokens, nextTokenChar);
		}
	});
	const finalText = text.trim().replace(/\s+/g, ' ');
	// warnArithmeticNotCalcWrapped(finalText);
	return {
		text: finalText,
		tokens,
		_isCssBrand: true,
		type: isSingleValue(finalText) ? 'value' : 'stylesheet',
	};
}

export type CssTemplate = typeof css;

function resolveInterpolation(
	value: CssInterpolation,
	tokens: Token[],
	nextCssToken: string,
): string {
	if (typeof value === 'string' || typeof value === 'number') {
		return `${value}`;
	} else if (isCss(value)) {
		tokens.push(...value.tokens);
		return value.text;
	} else if (isToken(value)) {
		// for left-hand of assignment, interpolate name and don't add a dependency.
		if (nextCssToken === ':') {
			return value.name;
		}
		tokens.push(value);
		return value.var;
	} else if (isTokenFallbackInterpolation(value)) {
		const [token, fallback] = value;
		tokens.push(token);
		const resolvedFallback = resolveInterpolation(
			fallback,
			tokens,
			nextCssToken,
		);
		return token.varFallback(resolvedFallback);
	} else if (Array.isArray(value) && value.every(isCss)) {
		return value
			.map((v) => resolveInterpolation(v, tokens, nextCssToken))
			.join('');
	}

	throw new Error(`Invalid CSS interpolation value: ${value}`);
}

function warnArithmeticNotCalcWrapped(finalText: string) {
	if (/\s[+\-*/]\s/.test(finalText) && !/calc\(/.test(finalText)) {
		console.warn(
			`Warning: CSS value "${finalText}" contains arithmetic operators but does not include calc(). This may lead to unexpected results. Consider wrapping it in calc() for proper evaluation.`,
		);
	}
}
