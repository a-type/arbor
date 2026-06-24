import { SimpleTokenSchema } from '@arbor-css/tokens';
import { global } from './global.js';
import { actionIntents } from './intents/action.js';
import { controlIntents } from './intents/control.js';
import { proseIntents } from './intents/prose.js';
import { surfaceIntents } from './intents/surface.js';
import { mainColorSemantics } from './semantics/color.js';
import { durationSemantics } from './semantics/duration.js';
import { easingSemantics } from './semantics/easing.js';
import { lineWidthSemantics } from './semantics/lines.js';
import { radiusSemantics } from './semantics/radius.js';
import { shadowSemantics } from './semantics/shadow.js';
import { spacingSemantics } from './semantics/spacing.js';
import { textSemantics } from './semantics/text.js';

export interface ArborModeSchemaOptions<TColorName extends PropertyKey> {
	colorNames: TColorName[];
}

export function createArborModeSchema<TColorName extends string>(
	options: ArborModeSchemaOptions<TColorName>,
) {
	return {
		// these influence all sorts of things
		global,

		// intents
		action: actionIntents,
		control: controlIntents,
		surface: surfaceIntents,
		prose: proseIntents,

		// semantic ranges
		color: mainColorSemantics(options.colorNames),
		space: spacingSemantics,
		lineWidth: lineWidthSemantics,
		radius: radiusSemantics,
		shadow: shadowSemantics,
		easing: easingSemantics,
		duration: durationSemantics,
		text: textSemantics,
	} satisfies SimpleTokenSchema;
}

export type ArborModeSchema<TColorName extends string = string> = ReturnType<
	typeof createArborModeSchema<TColorName>
>;
