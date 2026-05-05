import type { VariantFunction } from '@unocss/core';
import { Theme } from '../theme/types.js';
import { isColorLiteral, isNumericUnitLiteral } from '../util/tests.js';

export const placeholderModifier: VariantFunction<Theme> = (input: string) => {
	const m = input.match(/^(.*)\b(placeholder-)(.+)$/);
	if (m) {
		const [, pre = '', p, body] = m;
		if (isColorLiteral(body) || hasOpacityValue(body)) {
			return {
				// Append `placeholder-$ ` (with space!) to the rule to be matched.
				// The `placeholder-` is added for placeholder variant processing, and
				// the `$ ` is added for rule matching after `placeholder-` is removed by the variant.
				// See rules/placeholder.
				matcher: `${pre}placeholder-$ ${p}${body}`,
			};
		}
	}
};

function hasOpacityValue(body: string) {
	const match = body.match(/^op(?:acity)?-?(.+)$/);
	if (match && match[1] != null) return isNumericUnitLiteral(match[1]);
	return false;
}
