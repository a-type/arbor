import { ArborPreset } from '@arbor-css/core';
import { Rule } from 'unocss';
import { $classesProps } from '../properties.js';

// TODO: disable automatic root generation and make these act as on-demands?
export const createModeRules = (preset: ArborPreset<any, any>): Rule[] => [
	[
		/^@mode-(.+)$/,
		([, value]) => {
			const mode = preset.modes[value];
			if (!mode) return;
			return { [$classesProps.mode.name]: value };
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
			return { [$classesProps.scheme.name]: value };
		},
		{
			autocomplete: Object.keys(preset.primitives.colors).map(
				(scheme) => `@scheme-${scheme}`,
			),
		},
	],
];
