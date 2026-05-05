import { variantAria, variantTaggedAriaAttributes } from './aria.js';
import { variantBreakpoints } from './breakpoints.js';
import { variantChildren } from './children.js';
import { variantContainerQuery } from './container.js';
import { variantDataAttribute, variantTaggedDataAttributes } from './data.js';
import { variantLanguageDirections } from './directions.js';
import { variantImportant } from './important.js';
import { variantInert } from './inert.js';
import { variantCssLayer } from './layer.js';
import {
	variantContrasts,
	variantCustomMedia,
	variantForcedColors,
	variantMotions,
	variantNoscript,
	variantOrientations,
	variantPrint,
	variantScripting,
} from './media.js';
import { modeVariants } from './mode.js';
import { variantNegative } from './negative.js';
import { placeholderModifier } from './placeholder.js';
import {
	variantPseudoClassesAndElements,
	variantPseudoClassFunctions,
	variantTaggedPseudoClasses,
} from './pseudo.js';
import { variantStartingStyle } from './startingStyle.js';
import { stuckVariant } from './stuck.js';

export const variants = [
	variantAria,
	...variantTaggedAriaAttributes,
	variantBreakpoints,
	...variantChildren,
	variantContainerQuery,
	variantDataAttribute,
	variantImportant(),
	...variantLanguageDirections,
	...variantTaggedDataAttributes,
	...modeVariants,
	variantInert,
	stuckVariant,
	variantCssLayer,
	variantCustomMedia,
	variantNoscript,
	variantScripting,
	variantPrint,
	...variantContrasts,
	...variantMotions,
	...variantOrientations,
	...variantForcedColors,
	variantNegative,
	placeholderModifier,
	variantPseudoClassFunctions(),
	variantPseudoClassesAndElements(),
	...variantTaggedPseudoClasses(),
	variantStartingStyle,
];
