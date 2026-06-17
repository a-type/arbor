import { Css } from './interpolation.js';
import { unwrapDummyAssignment, wrapWithDummyAssignment } from './util.js';

/**
 * Applies simplifications not covered by LightningCSS.
 * Uses linear-time paren scanning instead of regex to avoid backtracking.
 */
export function simplifyPreprocessCss(css: string): string {
	let result = '';
	let searchIndex = 0;
	const calcKeyword = 'calc(';

	while (searchIndex < css.length) {
		const calcIndex = css.indexOf(calcKeyword, searchIndex);
		if (calcIndex === -1) {
			result += css.slice(searchIndex);
			break;
		}

		result += css.slice(searchIndex, calcIndex);
		const openParenIndex = calcIndex + 4; // position of '(' in 'calc('
		const closeParenIndex = findMatchingParen(css, openParenIndex);

		if (closeParenIndex === -1) {
			result += css.slice(calcIndex);
			break;
		}

		const content = css.slice(openParenIndex + 1, closeParenIndex);
		const simplified = simplifyLikeUnitDivision(content);
		result += 'calc(' + simplified + ')';
		searchIndex = closeParenIndex + 1;
	}

	return result;
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

function simplifyLikeUnitDivision(content: string): string {
	return content.replace(
		/([0-9]+)([a-z]+)\s*\/\s*([0-9]+)\2/g,
		(_match, num1, _unit1, num2) => {
			const simplifiedValue = parseFloat(num1) / parseFloat(num2);
			return simplifiedValue.toString();
		},
	);
}

export interface CssSimplificationOptions {
	/**
	 * More passes take longer but lead to further reduction
	 * of terms; this is really a quirk of the multiple
	 * tools/systems used to perform simplification.
	 * 2 is probably enough for anyone. Default is 1.
	 */
	passes: number;
}
export type CssSimplifier = (css: Css) => string;
export type CssTransformFunction = ({
	filename,
	code,
}: {
	filename: string;
	code: Uint8Array;
}) => { code: Uint8Array };

export function createSimplifier(config: {
	/**
	 * A LightningCSS transform function
	 */
	transform: CssTransformFunction;
	options?: CssSimplificationOptions;
}) {
	const enc = new TextEncoder();
	const dec = new TextDecoder();
	return (css: Css) => {
		let cssToTransform = css.text;

		for (let i = 0; i < (config.options?.passes ?? 1); i++) {
			cssToTransform = simplifyPreprocessCss(cssToTransform);

			if (css.type === 'value') {
				cssToTransform = wrapWithDummyAssignment(cssToTransform);
			}

			const result = config.transform({
				filename: 'input.css',
				code: enc.encode(cssToTransform),
			});

			if (css.type === 'value') {
				return unwrapDummyAssignment(dec.decode(result.code));
			}

			cssToTransform = dec.decode(result.code);
		}
		return cssToTransform;
	};
}
