import { Rule } from 'unocss';
import { Theme } from '../theme/types.js';
import {
	dashConcat,
	directionMapEntries,
	dirRegex,
	themeOrLiteral,
} from './_util.js';

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
