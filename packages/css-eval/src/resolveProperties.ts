import { isToken } from '@arbor-css/tokens';
import {
	css,
	Css,
	CssInterpolation,
	isCss,
	isTokenFallbackInterpolation,
} from './interpolation.js';

/**
 * Resolves (replaces) property references in the provided CSS
 * with the values from propertyValues. This is used to bake known
 * custom property values into CSS during build time. It also
 * handles updating token dependencies of the returned CSS
 * to reflect any resolved property values, including tokens
 * referenced within the values of resolved properties.
 */
export function resolveProperties(
	css: Css,
	propertyValues: Record<string, CssInterpolation>,
	resolvingStack: string[] = [],
): Css {
	const inputText = css.text;
	const tokens = [...css.tokens];
	let result = '';
	let searchIndex = 0;

	while (searchIndex < inputText.length) {
		const startIndex = inputText.indexOf('var(', searchIndex);
		if (startIndex === -1) {
			result += inputText.slice(searchIndex);
			break;
		}

		const endIndex = findMatchingParen(inputText, startIndex + 3);
		if (endIndex === -1) {
			result += inputText.slice(searchIndex);
			break;
		}

		const inner = inputText.slice(startIndex + 4, endIndex);
		const nameMatch = inner.match(/^\s*([^\s,]+)/);
		const property = nameMatch?.[1];

		result += inputText.slice(searchIndex, startIndex);
		searchIndex = endIndex + 1;

		if (property && resolvingStack.includes(property)) {
			// circular - leave unresolved.
			result += `var(${property})`;
		} else {
			const propertyValue = !!property && propertyValues[property];
			if (propertyValue) {
				const resolved = resolvePropertyValue(propertyValue, propertyValues, [
					...resolvingStack,
					property,
				]);
				tokens.push(...resolved.tokens);
				// remove successfully resolved properties from token dependencies, if present
				for (let i = tokens.length - 1; i >= 0; i--) {
					if (tokens[i].name === property) {
						tokens.splice(i, 1);
					}
				}
				result += resolved.text;
			} else {
				result += inputText.slice(startIndex, endIndex + 1);
			}
		}
	}

	return {
		text: result,
		tokens,
		_isCssBrand: true,
		type: css.type,
	};
}

function resolvePropertyValue(
	value: CssInterpolation,
	propertyValues: Record<string, CssInterpolation>,
	resolvingStack: string[] = [],
): Css {
	if (typeof value === 'string' || typeof value === 'number') {
		return resolveProperties(
			css`
				${value}
			`,
			propertyValues,
			resolvingStack,
		);
	} else if (isTokenFallbackInterpolation(value)) {
		const [token, fallback] = value;
		const resolvedFallback = resolvePropertyValue(
			fallback,
			propertyValues,
			resolvingStack,
		);
		return css`
			${[token, resolvedFallback]}
		`;
	} else if (isToken(value)) {
		return css`
			${value}
		`;
	} else if (isCss(value)) {
		return resolveProperties(value, propertyValues, resolvingStack);
	} else if (Array.isArray(value)) {
		const resolvedParts = value.map((part) =>
			resolvePropertyValue(part, propertyValues, resolvingStack),
		);
		return css`
			${resolvedParts}
		`;
	}

	throw new Error(`Unsupported property value: ${value}`);
}

function findMatchingParen(text: string, openParenIndex: number): number {
	let depth = 0;
	for (let i = openParenIndex; i < text.length; i++) {
		if (text[i] === '(') {
			depth++;
		} else if (text[i] === ')') {
			depth--;
			if (depth === 0) {
				return i;
			}
		}
	}

	return -1;
}
