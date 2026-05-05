import type { VariantObject } from '@unocss/core';
import type {
	PseudoVariantOptions,
	PseudoVariantUtilities,
} from '@unocss/rule-utils';
import {
	createPartClasses,
	createPseudoClassesAndElements,
	createPseudoClassFunctions,
	createTaggedPseudoClasses,
	getBracket,
	variantGetBracket,
} from '@unocss/rule-utils';
import { Theme } from '../theme/types.js';
import { h } from '../util/h.js';

export function variantPseudoClassesAndElements(): VariantObject<Theme>[] {
	const utils: PseudoVariantUtilities<any> = {
		getBracket,
		h,
		variantGetBracket,
	};
	return createPseudoClassesAndElements<any>(utils);
}

export function variantPseudoClassFunctions(): VariantObject<any> {
	const utils: PseudoVariantUtilities<any> = {
		getBracket,
		h,
		variantGetBracket,
	};
	return createPseudoClassFunctions<any>(utils);
}

export function variantTaggedPseudoClasses(
	options: PseudoVariantOptions = {},
): VariantObject<any>[] {
	const utils: PseudoVariantUtilities<any> = {
		getBracket,
		h,
		variantGetBracket,
	};
	return createTaggedPseudoClasses<any>(options, utils);
}

export const variantPartClasses: VariantObject<any> = createPartClasses<any>();
