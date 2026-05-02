import { createToken, Token } from '@arbor-css/tokens';

export interface GlobalConfig {
	saturation: number;
	roundness: number;
	baseFontSizePixels: number;
	spacingUnitPixels: number;
}

export const defaultGlobals: GlobalConfig = {
	saturation: 0.5,
	roundness: 0.5,
	baseFontSizePixels: 16,
	spacingUnitPixels: 8,
};

export const $globalProps = {
	saturation: createToken('🧑-sat', {
		type: 'number',
	}),
	roundness: createToken('🧑-round', {
		type: 'number',
	}),
	baseFontSizePixels: createToken('🧑-base-font-px', {
		type: 'length',
	}),
	spacingUnitPixels: createToken('🧑-spacing-unit-px', {
		type: 'length',
	}),
};

export function createGlobals(config: Partial<GlobalConfig>): GlobalConfig {
	return {
		...defaultGlobals,
		...config,
	};
}

export type GlobalConfigProps = {
	[K in keyof GlobalConfig]: Token;
};
