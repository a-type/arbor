import { createToken, Token } from '@arbor-css/tokens';

export interface GlobalConfig {
	saturation: number;
	roundness: number;
	baseFontSize: string;
	baseSpacingSize: string;
	defaultShadowColor: string;
	shadowSpread: number;
	shadowBlur: number;
}

export const defaultGlobals: GlobalConfig = {
	saturation: 0.5,
	roundness: 0.5,
	baseFontSize: '16px',
	baseSpacingSize: '8px',
	defaultShadowColor: 'rgba(0 0 0 / 0.5)',
	shadowSpread: 0,
	shadowBlur: 0.5,
};

export const $globalProps: GlobalConfigProps = {
	saturation: createToken('🧑-sat', {
		type: 'number',
	}),
	roundness: createToken('🧑-round', {
		type: 'number',
	}),
	baseFontSize: createToken('🧑-base-font-size', {
		type: 'length',
	}),
	baseSpacingSize: createToken('🧑-base-spacing-size', {
		type: 'length',
	}),
	defaultShadowColor: createToken('🧑-default-shadow-color', {
		type: 'color',
	}),
	shadowSpread: createToken('🧑-shadow-spread', {
		type: 'number',
	}),
	shadowBlur: createToken('🧑-shadow-blur', {
		type: 'number',
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
