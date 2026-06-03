import { SimpleTokenSchema } from '@arbor-css/tokens';
import { global } from './global.js';
import { actionIntents } from './intents/action.js';
import { controlIntents } from './intents/control.js';
import { surfaceIntents } from './intents/surface.js';
import { textIntents } from './intents/text.js';
import { createColorPrimitives } from './primitives/color.js';
import { durationPrimitives } from './primitives/duration.js';
import { easingPrimitives } from './primitives/easing.js';
import { shadowPrimitives } from './primitives/shadow.js';
import { spacingPrimitives } from './primitives/spacing.js';
import { typographyPrimitives } from './primitives/typography.js';
import { mainColorSemantics } from './semantics/color.js';
import { durationSemantics } from './semantics/duration.js';
import { easingSemantics } from './semantics/easing.js';
import { lineWidthSemantics } from './semantics/lines.js';
import { radiusSemantics } from './semantics/radius.js';
import { shadowSemantics } from './semantics/shadow.js';
import { spacingSemantics } from './semantics/spacing.js';

export interface ArborModeSchemaOptions<TColorName extends PropertyKey> {
	colorNames: TColorName[];
}

export function createArborModeSchema<TColorName extends string>(
	options: ArborModeSchemaOptions<TColorName>,
) {
	return {
		// these influence all sorts of things
		global,

		// primitive values
		primitive: {
			color: createColorPrimitives(options.colorNames),
			spacing: spacingPrimitives,
			typography: typographyPrimitives,
			shadow: shadowPrimitives,
			easing: easingPrimitives,
			duration: durationPrimitives,
		},

		// intents
		action: actionIntents,
		control: controlIntents,
		surface: surfaceIntents,
		text: textIntents,

		// semantic ranges
		color: mainColorSemantics,
		spacing: spacingSemantics,
		lineWidth: lineWidthSemantics,
		radius: radiusSemantics,
		shadow: shadowSemantics,
		easing: easingSemantics,
		duration: durationSemantics,
	} satisfies SimpleTokenSchema;
}

export type ArborModeSchema<TColorName extends string = string> = ReturnType<
	typeof createArborModeSchema<TColorName>
>;
