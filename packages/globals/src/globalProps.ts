import { createToken, Token } from '@arbor-css/tokens';

export interface GlobalConfig {
	saturation: number;
	roundness: number;
	baseFontSize: string;
	baseSpacingSize: string;
}

export const defaultGlobals: GlobalConfig = {
	saturation: 0.5,
	roundness: 0.5,
	baseFontSize: '16px',
	baseSpacingSize: '8px',
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
