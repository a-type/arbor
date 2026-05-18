import { createToken, CreateToken, Token } from '@arbor-css/tokens';

export interface GlobalConfig {
	saturation: number;
	roundness: number;
	baseFontSize: string;
	baseSpacingSize: string;
	defaultShadowColor: string;
	shadowSpread: number;
	shadowBlur: number;
	arrowWidth: string;
	arrowHeight: string;
	borderWidth: string;
}

export const defaultGlobals: GlobalConfig = {
	saturation: 0.5,
	roundness: 0.5,
	baseFontSize: '16px',
	baseSpacingSize: '8px',
	defaultShadowColor: 'rgba(0 0 0 / 0.15)',
	shadowSpread: 0,
	shadowBlur: 0.5,
	arrowWidth: '1rem',
	arrowHeight: '0.5rem',
	borderWidth: '1px',
};

export function createGlobalProps({
	createToken: createTokenValue = createToken,
}: {
	createToken?: CreateToken;
} = {}): GlobalConfigProps {
	return {
		saturation: createTokenValue('sat', {
			tag: 'system',
			type: 'number',
		}),
		roundness: createTokenValue('round', {
			tag: 'system',
			type: 'number',
		}),
		baseFontSize: createTokenValue('base-font-size', {
			tag: 'system',
			type: 'length',
		}),
		baseSpacingSize: createTokenValue('base-spacing-size', {
			tag: 'system',
			type: 'length',
		}),
		defaultShadowColor: createTokenValue('default-shadow-color', {
			tag: 'system',
			type: 'color',
		}),
		shadowSpread: createTokenValue('shadow-spread', {
			tag: 'system',
			type: 'number',
		}),
		shadowBlur: createTokenValue('shadow-blur', {
			tag: 'system',
			type: 'number',
		}),
		arrowWidth: createTokenValue('arrow-width', {
			tag: 'system',
			type: 'length',
		}),
		arrowHeight: createTokenValue('arrow-height', {
			tag: 'system',
			type: 'length',
		}),
		borderWidth: createTokenValue('border-width', {
			tag: 'system',
			type: 'length',
		}),
	};
}

export function createGlobals(config: Partial<GlobalConfig>): GlobalConfig {
	return {
		...defaultGlobals,
		...config,
	};
}

export type GlobalConfigProps = {
	[K in keyof GlobalConfig]: Token;
};
