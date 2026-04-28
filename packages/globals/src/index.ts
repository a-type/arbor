import { createToken, Token } from '@arbor-css/tokens';

export interface PrimitiveGlobals {
	saturation: number;
	roundness: number;
}

export const defaultGlobals: PrimitiveGlobals = {
	saturation: 0.5,
	roundness: 0.5,
};

export function createGlobalProps(
	config: Partial<PrimitiveGlobals>,
): GlobalConfigProps {
	return {
		saturation: createToken('🧑-sat', {
			type: 'number',
			fallback: config.saturation,
		}),
		roundness: createToken('🧑-round', {
			type: 'number',
			fallback: config.roundness,
		}),
	};
}

export const $globalPropsUnset = createGlobalProps({});

export type GlobalConfigProps = {
	[K in keyof PrimitiveGlobals]: Token;
};
