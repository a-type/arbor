import { Token } from './createToken.js';

export function isColorToken(token: Token) {
	return (
		token.syntax.includes('<color>') ||
		['color', 'background', 'border-color', 'shadow-color'].includes(
			token.purpose,
		)
	);
}

export function isSizeToken(token: Token) {
	return (
		token.syntax.includes('<length>') ||
		token.syntax.includes('<length-percentage>') ||
		[
			'font-size',
			'line-height',
			'letter-spacing',
			'spacing',
			'size',
			'border-radius',
			'border-width',
			'shadow-blur',
			'shadow-spread',
			'shadow-x',
			'shadow-y',
		].includes(token.purpose)
	);
}

export function isScalarToken(token: Token) {
	return (
		token.syntax.includes('<number>') ||
		['font-weight', 'scalar'].includes(token.purpose)
	);
}

export function isEasingFunctionToken(token: Token) {
	return (
		token.syntax.includes('<string>') && token.purpose === 'easing-function'
	);
}

export function isDurationToken(token: Token) {
	return token.syntax.includes('<time>') && token.purpose === 'duration';
}
