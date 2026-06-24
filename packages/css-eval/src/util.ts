import { TokenPurpose } from '@arbor-css/tokens';
import { replaceTopLevelTerms } from '@arbor-css/util';

/**
 * LightningCSS only supports parsing full
 * stylesheets, but we often need to resolve
 * single CSS values. This checks to see if we
 * need to apply special processing to handle that case.
 */
export function isSingleValue(css: string): boolean {
	// CSS if() syntax includes colons and semicolons internally.
	// without that, it would be easy... so remove all
	// if(...) calls, using a regex that handles nested parentheses, and then
	// check for colons and semicolons.
	const withoutIf = css.replace(
		/if\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/g,
		'',
	);
	return !withoutIf.includes(':') && !withoutIf.includes(';');
}

const purposeToPropertyTarget: Record<TokenPurpose, string> = {
	color: 'background',
	background: 'background',
	'border-radius': 'border-radius',
	shadow: 'box-shadow',
	'border-style': 'border-style',
	'border-width': 'border-width',
	'font-size': 'font-size',
	'font-weight': 'font-weight',
	'easing-function': 'animation-timing-function',
	'font-family': 'font-family',
	'letter-spacing': 'letter-spacing',
	'line-height': 'line-height',
	duration: 'transition-duration',
	'shadow-blur': 'width',
	'shadow-color': 'background',
	'shadow-spread': 'width',
	'shadow-x': 'width',
	'shadow-y': 'width',
	border: 'border',
	scalar: 'line-height',
	size: 'width',
	spacing: 'width',
	'keyframe-name': 'animation-name',
	other: 'background', // picked as a versatile simplifier property
};

export function guessPurposeFromText(css: string): TokenPurpose {
	// values with spaces in them could be border or shadow shorthands... or
	// many other kinds of shorthands...
	const withoutTermContents = replaceTopLevelTerms(css, () => '<term>');
	const termCount = withoutTermContents.split(/\s+/).length;
	if (termCount > 1) {
		if (termCount === 2) {
			return 'border-style';
		} else if (termCount === 3) {
			return 'border';
		} else if (termCount > 3) {
			return 'shadow';
		}
	}

	// This is a very rough heuristic to determine the purpose of a token based on its value,
	// which helps us choose appropriate simplification strategies.
	if (
		css.includes('rgb') ||
		css.includes('okl') ||
		css.includes('#') ||
		css.includes('hsl') ||
		css.includes('lab') ||
		css.includes('lch') ||
		css.includes('color')
	) {
		return 'color';
	}

	return 'other';
}

export function wrapWithDummyAssignment(
	css: string,
	purpose: TokenPurpose = guessPurposeFromText(css),
): string {
	const propertyName = purposeToPropertyTarget[purpose] || 'background';
	// Wrap the input in a dummy assignment to make it parseable as a stylesheet.
	// We can remove this later since we only care about the value of the variable.
	return `[data-arbor-result]{${propertyName}:${css};}`;
}

export function unwrapDummyAssignment(css: string): string {
	// Extract the original value from the dummy assignment.
	const match = css.match(
		/\[data-arbor-result\]\s*{\s*[\w-]+\s*:\s*(.+?)\s*;?\s*}/,
	);
	if (!match) {
		throw new Error('Invalid dummy assignment format');
	}
	return match[1];
}
