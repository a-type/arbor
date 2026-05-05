import { Rule } from 'unocss';
import { Theme } from '../theme/types.js';
import { dashConcat } from '../util/concat.js';
import { directionMapEntries } from '../util/mappings.js';
import { dirRegex } from '../util/matchers.js';
import { themeOrLiteral } from '../util/themeOrLiteral.js';

function makeSpacingRules(
	shorthand: string,
	cssPropGroup: string,
	themeKey: keyof Theme,
): Rule<Theme>[] {
	return directionMapEntries.map(([dirSuffix, cssProps]) => {
		return [
			new RegExp(`^${shorthand}${dirRegex(dirSuffix)}-(.+)$`),
			([, size], { theme }) => {
				const [value] = themeOrLiteral(size, theme, {
					startFrom: themeKey,
				});
				if (!value) return;
				return Object.fromEntries(
					cssProps.map((prop) => [dashConcat(cssPropGroup, prop), value]),
				);
			},
		] as Rule<Theme>;
	});
}

export const spacingRules: Rule<Theme>[] = [
	...makeSpacingRules('p', 'padding', 'spacing'),
	...makeSpacingRules('m', 'margin', 'spacing'),
	...makeSpacingRules('gap', 'gap', 'spacing'),
	...makeSpacingRules('gap-row', 'row-gap', 'spacing'),
	...makeSpacingRules('gap-col', 'column-gap', 'spacing'),
];
