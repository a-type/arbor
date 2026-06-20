const declarationRegex = /([\w-]+)\s*:\s*([^;{}]+)\s*;?/g;

const spacingAndSizeProperties = new Set([
	'margin',
	'margin-top',
	'margin-right',
	'margin-bottom',
	'margin-left',
	'padding',
	'padding-top',
	'padding-right',
	'padding-bottom',
	'padding-left',
	'gap',
	'row-gap',
	'column-gap',
	'inset',
	'inset-block',
	'inset-inline',
	'inset-block-start',
	'inset-block-end',
	'inset-inline-start',
	'inset-inline-end',
	'top',
	'right',
	'bottom',
	'left',
	'width',
	'min-width',
	'max-width',
	'height',
	'min-height',
	'max-height',
	'font-size',
	'line-height',
	'letter-spacing',
	'word-spacing',
	'border-radius',
	'border-top-left-radius',
	'border-top-right-radius',
	'border-bottom-right-radius',
	'border-bottom-left-radius',
	'border-width',
	'border-top-width',
	'border-right-width',
	'border-bottom-width',
	'border-left-width',
	'outline-width',
]);

const colorProperties = new Set([
	'color',
	'background',
	'background-color',
	'border-color',
	'border-top-color',
	'border-right-color',
	'border-bottom-color',
	'border-left-color',
	'outline-color',
	'text-decoration-color',
	'text-emphasis-color',
	'caret-color',
	'accent-color',
	'fill',
	'stroke',
	'box-shadow',
	'text-shadow',
]);

const cssLengthOrPercentRegex =
	/\b-?(?:\d+\.\d+|\d*\.\d+|\d+)(?:px|rem|em|ex|ch|vh|vw|vmin|vmax|svh|lvh|dvh|svw|lvw|dvw|cqw|cqh|cqmin|cqmax|%|cm|mm|in|pt|pc)\b/i;

const cssColorRegex =
	/#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})\b|\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\s*\(/i;

const allowedExactValues = new Set([
	'inherit',
	'initial',
	'unset',
	'revert',
	'revert-layer',
	'auto',
	'none',
	'normal',
	'transparent',
	'currentcolor',
	'0',
	'0px',
	'0rem',
	'0em',
	'0%',
]);

export interface ArbitraryValueWarning {
	start: number;
	end: number;
	message: string;
}

export function findArbitraryValueWarnings(
	line: string,
	tokenPrefixes: readonly string[],
): ArbitraryValueWarning[] {
	const warnings: ArbitraryValueWarning[] = [];
	if (line.trimStart().startsWith('@media')) {
		// skip media query conditions, which may contain arbitrary values but cannot
		// actually reference properties
		return warnings;
	}

	for (const match of line.matchAll(declarationRegex)) {
		if (match.index === undefined) continue;

		const property = match[1]?.toLowerCase();
		const value = match[2]?.trim();
		if (!property || !value || property.startsWith('--')) continue;

		if (allowedExactValues.has(value.toLowerCase())) continue;
		if (includesTokenReference(value, tokenPrefixes)) continue;

		if (colorProperties.has(property) && hasColorLiteral(value)) {
			warnings.push(
				createWarning(match.index, match[0], value, {
					message:
						'Prefer an Arbor semantic token over an arbitrary color value.',
				}),
			);
			continue;
		}

		if (spacingAndSizeProperties.has(property) && hasLengthLiteral(value)) {
			warnings.push(
				createWarning(match.index, match[0], value, {
					message:
						'Prefer an Arbor semantic token over an arbitrary spacing or sizing value.',
				}),
			);
		}
	}

	return warnings;
}

function includesTokenReference(
	value: string,
	tokenPrefixes: readonly string[],
): boolean {
	return tokenPrefixes.some((prefix) => value.includes(prefix));
}

function hasLengthLiteral(value: string): boolean {
	return cssLengthOrPercentRegex.test(value);
}

function hasColorLiteral(value: string): boolean {
	return cssColorRegex.test(value);
}

function createWarning(
	matchStart: number,
	fullMatch: string,
	rawValue: string,
	options: { message: string },
): ArbitraryValueWarning {
	const valueOffset = fullMatch.lastIndexOf(rawValue);
	const start = matchStart + (valueOffset >= 0 ? valueOffset : 0);
	const end = start + rawValue.length;
	return {
		start,
		end,
		message: options.message,
	};
}
