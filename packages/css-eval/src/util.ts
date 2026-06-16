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

const dummyPreamble = '[data-arbor-result]{font-size:';
const dummyPostamble = '}';

export function wrapWithDummyAssignment(css: string): string {
	// Wrap the input in a dummy assignment to make it parseable as a stylesheet.
	// We can remove this later since we only care about the value of the variable.
	return `${dummyPreamble}${css}${dummyPostamble}`;
}

export function unwrapDummyAssignment(css: string): string {
	// Extract the original value from the dummy assignment.
	const match = css.match(
		/\[data-arbor-result\]\s*{\s*font-size\s*:\s*(.+?)\s*;?\s*}/,
	);
	if (!match) {
		throw new Error('Invalid dummy assignment format');
	}
	return match[1];
}
