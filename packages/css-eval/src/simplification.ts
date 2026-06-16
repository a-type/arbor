import type { transform as transformNode } from 'lightningcss';
import MagicString from 'magic-string';
import { Css } from './interpolation.js';
import { unwrapDummyAssignment, wrapWithDummyAssignment } from './util.js';

const braceMatchingCalcContentExtractor =
	/calc\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/g;

/**
 * Applies simplifications not covered by LightningCSS.
 */
export function simplifyPreprocessCss(css: string) {
	const magic = new MagicString(css);
	magic.replaceAll(braceMatchingCalcContentExtractor, (match) => {
		const content = new MagicString(match);
		simplifyLikeUnitDivision(content);
		return content.toString();
	});
	return magic.toString();
}

function simplifyLikeUnitDivision(content: MagicString) {
	content.replaceAll(
		/([0-9]+)([a-z]+)\s*\/\s*([0-9]+)\2/g,
		(_match, num1, _unit1, num2) => {
			const simplifiedValue = parseFloat(num1) / parseFloat(num2);
			return simplifiedValue.toString();
		},
	);
}

export type CssSimplifier = (css: Css) => string;
export type CssTransformFunction = typeof transformNode;

export function createSimplifier(config: {
	/**
	 * A LightningCSS transform function
	 */
	transform: CssTransformFunction;
}) {
	const enc = new TextEncoder();
	const dec = new TextDecoder();
	return (css: Css) => {
		let cssToTransform = css.text;

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

		return dec.decode(result.code);
	};
}
