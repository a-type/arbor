import { isToken, Token } from '@arbor-css/tokens';
import {} from 'lightningcss';

export interface Css {
	text: string;
	tokens: Token[];
}

export type TokenFallbackInterpolation = [Token, CssInterpolation];
export type CssInterpolation =
	| string
	| number
	| Token
	| TokenFallbackInterpolation
	| Css;

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
			('text' in value[1] && 'tokens' in value[1]))
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
			text += resolveInterpolation(value, tokens);
		}
	});
	return { text, tokens };
}

function resolveInterpolation(
	value: CssInterpolation,
	tokens: Token[],
): string {
	if (typeof value === 'string' || typeof value === 'number') {
		return `${value}`;
	} else if ('text' in value && 'tokens' in value) {
		tokens.push(...value.tokens);
		return value.text;
	} else if (isToken(value)) {
		tokens.push(value);
		return value.var;
	} else if (isTokenFallbackInterpolation(value)) {
		const [token, fallback] = value;
		tokens.push(token);
		const resolvedFallback = resolveInterpolation(fallback, tokens);
		return token.varFallback(resolvedFallback);
	}

	throw new Error(`Invalid CSS interpolation value: ${value}`);
}
