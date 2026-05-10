import { ArborPreset } from '@arbor-css/core';
import { Rule } from 'unocss';

// TODO: disable automatic root generation and make these act as on-demands?
export const createModeRules = (preset: ArborPreset<any, any>): Rule[] => [
	[
		/^@mode-(.+)$/,
		([, value]) => {
			const mode = preset.modes[value];
			if (!mode) return;
			return { '--🍂-mode': value };
		},
		{
			autocomplete: Object.keys(preset.modes).map((mode) => `@mode-${mode}`),
		},
	],
	[
		/^@scheme-(.+)$/,
		([, value]) => {
			const scheme = preset.primitives.colors[value];
			if (!scheme) return;
			return { '--🍂-scheme': value };
		},
		{
			autocomplete: Object.keys(preset.primitives.colors).map(
				(scheme) => `@scheme-${scheme}`,
			),
		},
	],
];
