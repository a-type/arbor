import { CreateToken, Token } from '@arbor-css/tokens';

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
	createToken: createTokenValue,
}: {
	createToken: CreateToken;
}): GlobalConfigProps {
	return {
		saturation: createTokenValue('sat', {
			description:
				'Controls the overall saturation intensity used when deriving Arbor colors.',
			tag: 'system',
			type: 'number',
		}),
		roundness: createTokenValue('round', {
			description:
				'Scales rounded corners and other rounded treatments across the system.',
			tag: 'system',
			type: 'number',
		}),
		baseFontSize: createTokenValue('base-font-size', {
			description:
				'Defines the root font size used to derive Arbor typography tokens.',
			tag: 'system',
			type: 'length',
		}),
		baseSpacingSize: createTokenValue('base-spacing-size', {
			description:
				'Defines the base spacing unit used to derive Arbor spacing and layout tokens.',
			tag: 'system',
			type: 'length',
		}),
		defaultShadowColor: createTokenValue('default-shadow-color', {
			description:
				'Provides the default shadow color used when a shadow token does not supply its own color.',
			tag: 'system',
			type: 'color',
		}),
		shadowSpread: createTokenValue('shadow-spread', {
			description:
				'Scales the spread component used by generated shadow primitives.',
			tag: 'system',
			type: 'number',
		}),
		shadowBlur: createTokenValue('shadow-blur', {
			description:
				'Scales the blur component used by generated shadow primitives.',
			tag: 'system',
			type: 'number',
		}),
		arrowWidth: createTokenValue('arrow-width', {
			description:
				'Defines the default width for built-in arrow and caret shapes.',
			tag: 'system',
			type: 'length',
		}),
		arrowHeight: createTokenValue('arrow-height', {
			description:
				'Defines the default height for built-in arrow and caret shapes.',
			tag: 'system',
			type: 'length',
		}),
		borderWidth: createTokenValue('border-width', {
			description:
				'Defines the default border width used by Arbor border tokens.',
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
