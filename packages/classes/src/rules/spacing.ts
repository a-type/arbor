import { Rule } from 'unocss';
import { Theme } from '../theme/types.js';
import { dashConcat } from '../util/concat.js';
import {
	directionMap,
	directionMapEntries,
	DirectionMapKey,
} from '../util/mappings.js';
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
				let [value] = themeOrLiteral(size, theme, {
					startFrom: themeKey,
					trySuffixes: [
						'spacing',
						'space',
						's',
						'p',
						'm',
						(
							directionMap[dirSuffix as DirectionMapKey].some((d) =>
								d.includes('inline'),
							)
						) ?
							['inline', 'horizontal', 'x']
						:	undefined,
						(
							directionMap[dirSuffix as DirectionMapKey].some((d) =>
								d.includes('block'),
							)
						) ?
							['block', 'vertical', 'y']
						:	undefined,
					]
						.flat()
						.filter(Boolean) as string[],
				});
				if (!value) {
					// if this is a non-directional rule, try looking for a combination of
					// block and inline values in the theme (e.g. for "p-action", look for "action.padding.block" and "action.padding.inline")
					if (!dirSuffix) {
						const blockValue = themeOrLiteral(`${size}-block`, theme, {
							startFrom: themeKey,
							trySuffixes: ['padding', 'space', 's', 'p', 'm'],
						})[0];
						const inlineValue = themeOrLiteral(`${size}-inline`, theme, {
							startFrom: themeKey,
							trySuffixes: ['padding', 'space', 's', 'p', 'm'],
						})[0];
						if (blockValue && inlineValue) {
							value = `${blockValue} ${inlineValue}`;
						}
					}
				}
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
