import presetMini from '@unocss/preset-mini';
import { Preset, transformerVariantGroup } from 'unocss';
import { presetFunctionCompletion } from 'unocss-preset-completion';
import { AllPreflightOptions, preflights } from './preflights';
import { rules } from './rules';
import { makeTheme } from './theme';
import { variants } from './variants';

const modifiedWind4 = presetMini({
	arbitraryVariants: true,
	variablePrefix: 'ar-',
});

modifiedWind4.rules = rules;

export interface ArborConfig extends AllPreflightOptions {}

export default function presetArbor(config: ArborConfig): Preset {
	modifiedWind4.theme = makeTheme(config);

	return {
		name: 'arbor',
		enforce: 'post',
		variants,
		presets: [
			modifiedWind4,
			presetFunctionCompletion({
				autocompleteFunctions: ['css', 'clsx', 'classNames', 'cx'],
			}),
		],
		transformers: [transformerVariantGroup()],
		preflights: preflights(config),
	};
}
