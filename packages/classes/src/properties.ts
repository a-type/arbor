import { createToken } from '@arbor-css/preset';

export const $classesProps = {
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
	mode: createToken('🤵-mode', {}),
	scheme: createToken('🤵-scheme', {}),
};
