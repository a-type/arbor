import {
	ArborConfig,
	convertStructure,
	getPropShapeFromMode,
	isToken,
} from '@arbor-css/core';
import { Theme } from '@unocss/preset-wind4';

export function createTheme(arbor: ArborConfig<any, any>) {
	const primitiveColors = convertStructure(
		arbor.primitives.$props.colors,
		(item) => isToken(item),
		(token) => token.var,
	);

	const baseModeProps = getPropShapeFromMode(arbor.modes.base);
	const modeColors = convertStructure(baseModeProps, isToken, (token) =>
		token.type === 'color' ? token.var : undefined,
	);

	return {
		colors: {
			...primitiveColors,
			...modeColors,
		},
	} satisfies Theme;
}
