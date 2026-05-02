import { createToken, Token } from '@arbor-css/tokens';

export interface PrimitiveGlobals {
	saturation: number;
	roundness: number;
	baseFontSizePixels: number;
	spacingUnitPixels: number;
}

export const defaultGlobals: PrimitiveGlobals = {
	saturation: 0.5,
	roundness: 0.5,
	baseFontSizePixels: 16,
	spacingUnitPixels: 8,
};

export function createGlobals(
	config: Partial<PrimitiveGlobals>,
): PrimitiveGlobals {
	return {
		...defaultGlobals,
		...config,
	};
}

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
		baseFontSizePixels: createToken('🧑-base-font-px', {
			type: 'length',
			fallback: config.baseFontSizePixels + 'px',
		}),
		spacingUnitPixels: createToken('🧑-spacing-unit-px', {
			type: 'length',
			fallback: config.spacingUnitPixels + 'px',
		}),
	};
}

export const $globalPropsUnset = createGlobalProps(defaultGlobals);

export type GlobalConfigProps = {
	[K in keyof PrimitiveGlobals]: Token;
};
