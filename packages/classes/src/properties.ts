import { createToken } from '@arbor-css/preset';

export const $classesProps = {
	transform: {
		rotate: createToken('🤵-rotate', {
			type: 'angle',
			fallback: '0deg',
			forceDefinition: true,
			inherits: false,
		}),
		rotateX: createToken('🤵-rotate-x', {
			type: 'angle',
			fallback: '0deg',
			forceDefinition: true,
			inherits: false,
		}),
		rotateY: createToken('🤵-rotate-y', {
			type: 'angle',
			fallback: '0deg',
			forceDefinition: true,
			inherits: false,
		}),
		rotateZ: createToken('🤵-rotate-z', {
			type: 'angle',
			fallback: '0deg',
			forceDefinition: true,
			inherits: false,
		}),
		scaleX: createToken('🤵-scale-x', {
			type: 'number',
			fallback: '1',
			forceDefinition: true,
			inherits: false,
		}),
		scaleY: createToken('🤵-scale-y', {
			type: 'number',
			fallback: '1',
			forceDefinition: true,
			inherits: false,
		}),
		scaleZ: createToken('🤵-scale-z', {
			type: 'number',
			fallback: '1',
			forceDefinition: true,
			inherits: false,
		}),
		skewX: createToken('🤵-skew-x', {
			type: 'angle',
			fallback: '0deg',
			forceDefinition: true,
			inherits: false,
		}),
		skewY: createToken('🤵-skew-y', {
			type: 'angle',
			fallback: '0deg',
			forceDefinition: true,
			inherits: false,
		}),
		translateX: createToken('🤵-translate-x', {
			type: 'length-percentage',
			fallback: '0',
			forceDefinition: true,
			inherits: false,
		}),
		translateY: createToken('🤵-translate-y', {
			type: 'length-percentage',
			fallback: '0',
			forceDefinition: true,
			inherits: false,
		}),
		translateZ: createToken('🤵-translate-z', {
			type: 'length-percentage',
			fallback: '0',
			forceDefinition: true,
			inherits: false,
		}),
		perspective: createToken('🤵-perspective', {
			type: '*',
			fallback: '',
			forceDefinition: true,
			inherits: false,
		}),
	},
	ring: {
		color: createToken('🤵-ring-color', {
			type: 'color',
			fallback: 'rgb(147 197 253 / 0.5)',
			forceDefinition: true,
			inherits: false,
		}),
		width: createToken('🤵-ring-width', {
			type: 'length',
			fallback: '0px',
			forceDefinition: true,
			inherits: false,
		}),
		shadow: createToken('🤵-ring-shadow', {
			fallback: '',
			forceDefinition: true,
			inherits: false,
		}),
		inset: createToken('🤵-ring-inset', {
			fallback: '',
			forceDefinition: true,
			inherits: false,
		}),
		offsetWidth: createToken('🤵-ring-offset-width', {
			fallback: '1px',
			forceDefinition: true,
			inherits: false,
		}),
		offsetColor: createToken('🤵-ring-offset-color', {
			type: 'color',
			fallback: 'rgb(147 197 253 / 0.5)',
			forceDefinition: true,
			inherits: false,
		}),
		offsetShadow: createToken('🤵-ring-offset-shadow', {
			fallback: ' ',
			forceDefinition: true,
			inherits: false,
		}),
	},
	shadow: {
		color: createToken('🤵-shadow-color', {
			type: 'color',
			fallback: 'rgb(0 0 0 / 0)',
			forceDefinition: true,
			inherits: false,
		}),
		shadow: createToken('🤵-shadow-shadow', {
			fallback: '0 0 0 rgb(0 0 0 / 0)',
			forceDefinition: true,
			inherits: false,
		}),
		inset: createToken('🤵-shadow-inset', {
			fallback: ' ',
			forceDefinition: true,
			inherits: false,
		}),
	},
	background: {
		gradient: createToken('🤵-background-gradient', {}),
		gradientFromPosition: createToken(
			'🤵-background-gradient-from-position',
			{},
		),
		gradientFrom: createToken('🤵-background-gradient-from', {}),
		gradientViaPosition: createToken('🤵-background-gradient-via-position', {}),
		gradientVia: createToken('🤵-background-gradient-via', {}),
		gradientToPosition: createToken('🤵-background-gradient-to-position', {}),
		gradientTo: createToken('🤵-background-gradient-to', {}),
	},
	mode: createToken('🤵-mode', {}),
	scheme: createToken('🤵-scheme', {}),
};
