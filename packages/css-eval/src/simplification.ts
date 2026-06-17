import { TokenPurpose } from '@arbor-css/tokens';
import { replaceTopLevelTerms } from '@arbor-css/util';
import { Css } from './interpolation.js';
import { unwrapDummyAssignment, wrapWithDummyAssignment } from './util.js';

/**
 * Applies simplifications not covered by LightningCSS.
 * Uses linear-time paren scanning instead of regex to avoid backtracking.
 */
export function simplifyPreprocessCss(css: string): string {
	return replaceTopLevelTerms(css, (term) => {
		if (term.startsWith('calc(')) {
			return 'calc(' + simplifyLikeUnitDivision(term.slice(5, -1)) + ')';
		}
		return term;
	});
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
export type CssSimplifier = (
	css: Css,
	options?: {
		purpose?: TokenPurpose;
	},
) => string;
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
}): CssSimplifier {
	const enc = new TextEncoder();
	const dec = new TextDecoder();
	return (css: Css, options) => {
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
