import { ArborConfig, convertStructure, isToken } from '@arbor-css/core';

export function createTheme(arbor: ArborConfig<any, any>) {
	const colorTheme = convertStructure(
		arbor.primitives.$props.colors,
		(item) => isToken(item),
		(token) => `var(--${token.name})`,
	);

	return {
		color: colorTheme,
	};
}
