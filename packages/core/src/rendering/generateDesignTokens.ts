import { CssEnvValues, CssSimplifier } from '@arbor-css/css-eval';
import { ArborPreset } from '@arbor-css/preset';
import {
	isColorToken,
	isDurationToken,
	isScalarToken,
	isSizeToken,
	isToken,
	Token,
} from '@arbor-css/tokens';
import { convertStructure } from '@arbor-css/util';
import { Color, DesignToken } from 'design-tokens-format-module';
import { resolveComputedTokenValue } from '../util/resolveComputedTokenValue.js';

export function generateDesignTokens(
	preset: ArborPreset,
	options: {
		simplifier?: CssSimplifier;
		envValues?: CssEnvValues;
	} = {},
) {
	function getSchemeColorSchema(scheme: 'light' | 'dark') {
		return convertStructure(
			preset.$.mode,
			(item): item is Token => {
				return isToken(item) && isColorToken(item);
			},
			(token) => toDesignToken(token, preset, options, scheme),
		);
	}

	return convertStructure(
		{
			...convertStructure(
				preset.$.mode,
				(item): item is Token => {
					return isToken(item) && !isColorToken(item);
				},
				(token) => toDesignToken(token, preset, options),
			),
			'@light': getSchemeColorSchema('light'),
			'@dark': getSchemeColorSchema('dark'),
		},
		// eliminate any unconverted tokens and empty groups
		(item): item is any =>
			isToken(item) ||
			!item ||
			(typeof item === 'object' &&
				Object.values(item).filter((v) => v).length === 0),
		() => undefined,
	);
}

function toExtensions(token: Token, value: string, more?: Record<string, any>) {
	const tokenExtensions: Record<string, any> = {
		name: token.name,
		purpose: token.purpose,
		group: token.group,
		tag: token.tag,
		contributedBy: token.contributedBy,
		syntax: token.syntax,
		value,
	};

	return Object.fromEntries(
		[...Object.entries(tokenExtensions), ...Object.entries(more || {})].map(
			([key, value]) => [`dev.arbor-css.${key}`, value],
		),
	);
}

function toDesignToken(
	token: Token,
	preset: ArborPreset,
	options: { simplifier?: CssSimplifier; envValues?: CssEnvValues },
	scheme: 'light' | 'dark' = 'light',
): DesignToken | undefined {
	const value = resolveComputedTokenValue(preset, token.name, {
		simplifier: options.simplifier,
		envValues: {
			deviceHeightPx: 1080,
			deviceWidthPx: 1920,
			remPx: 16,
			...options.envValues,
		},
	});
	if (!value) {
		throw new Error(`Unable to resolve value for token ${token.name}`);
	}

	if (isColorToken(token)) {
		return toColorToken({
			token,
			value,
			scheme,
		});
	}

	if (isSizeToken(token)) {
		return toSizeToken(token, value);
	}

	if (isDurationToken(token)) {
		return toDurationToken(token, value);
	}

	if (isScalarToken(token)) {
		return toNumberToken(token, value);
	}

	return {
		$type: '*' as any,
		$value: value,
	};
}

function toColorToken({
	token,
	value,
	scheme,
}: {
	token: Token;
	value: string;
	scheme: 'light' | 'dark';
}): Color.Token {
	const colorValue = extractSchemeColorValue(value, scheme);
	return {
		$type: 'color',
		$value: parseColor(colorValue),
		$extensions: toExtensions(token, value, { scheme }),
		$description: token.description,
		$deprecated: token.deprecated,
	};
}

function extractSchemeColorValue(value: string, scheme: 'light' | 'dark') {
	if (value.startsWith('light-dark')) {
		const matches = value.match(/light-dark\((.+),\s?(.+)\)/);
		if (matches) {
			const [, lightValue, darkValue] = matches;
			if (scheme === 'light') {
				return lightValue.trim();
			} else {
				return darkValue.trim();
			}
		}
	}
	return value;
}

function parseColor(value: string): Color.Value {
	// Handle hex colors
	if (value.startsWith('#')) {
		const { r, g, b, alpha } = parseHexColor(value);
		return {
			colorSpace: 'srgb',
			components: [r, g, b],
			alpha,
			hex: value as `#${string}`,
		};
	}

	if (value === 'none' || value === 'transparent') {
		return {
			colorSpace: 'srgb',
			components: [0, 0, 0],
			alpha: 0,
		};
	}

	const [, space, components, alpha] =
		value.match(
			/(\w+)\(([\d\s%,.]+)(?:\s[\/,]\s([\d%.]+))?(?:,\s*([\d.]+))?\)/,
		) || [];
	if (space && components) {
		const comps = components.split(',').map((c) => parseInt(c.trim()));
		return {
			colorSpace: space as any,
			components: comps as any,
			alpha: alpha ? parseFloat(alpha) : 1,
		};
	}

	throw new Error(`Unsupported color format: ${value}`);
}

function parseHexColor(value: string) {
	const hex = value.slice(1);
	if (hex.length === 3) {
		const r = parseInt(hex[0] + hex[0], 16);
		const g = parseInt(hex[1] + hex[1], 16);
		const b = parseInt(hex[2] + hex[2], 16);
		return { r, g, b, alpha: 1 };
	} else if (hex.length === 6) {
		const r = parseInt(hex.slice(0, 2), 16);
		const g = parseInt(hex.slice(2, 4), 16);
		const b = parseInt(hex.slice(4, 6), 16);
		return { r, g, b, alpha: 1 };
	} else if (hex.length === 8) {
		const r = parseInt(hex.slice(0, 2), 16);
		const g = parseInt(hex.slice(2, 4), 16);
		const b = parseInt(hex.slice(4, 6), 16);
		const a = parseInt(hex.slice(6, 8), 16) / 255;
		return { r, g, b, alpha: a };
	}
	throw new Error(`Invalid hex color: ${value}`);
}

function toSizeToken(token: Token, value: string): DesignToken {
	const match = value.match(/^([\d.]+)(\w+)?$/);
	if (!match) {
		throw new Error(`Unsupported size format: ${value}`);
	}

	const [, number, unit] = match;

	if (!unit) {
		return {
			$type: 'number',
			$value: parseFloat(number),
			$extensions: toExtensions(token, value),
			$description: token.description,
			$deprecated: token.deprecated,
		};
	}

	return {
		$type: 'dimension',
		$value: {
			unit: unit as 'px' | 'rem',
			value: parseFloat(number),
		},
		$extensions: toExtensions(token, value, { unit }),
		$description: token.description,
		$deprecated: token.deprecated,
	};
}

function toDurationToken(token: Token, value: string): DesignToken {
	const match = value.match(/^([\d.]+)(\w+)$/);
	if (!match) {
		throw new Error(`Unsupported duration format: ${value}`);
	}

	const [, number, unit] = match;
	return {
		$type: 'duration',
		$value: {
			unit: unit as 'ms' | 's',
			value: parseFloat(number),
		},
		$extensions: toExtensions(token, value, { unit }),
		$description: token.description,
		$deprecated: token.deprecated,
	};
}

function toNumberToken(token: Token, value: string): DesignToken {
	const num = parseFloat(value);
	if (isNaN(num)) {
		throw new Error(`Unsupported number format: ${value}`);
	}

	return {
		$type: 'number',
		$value: num,
		$extensions: toExtensions(token, value),
		$description: token.description,
		$deprecated: token.deprecated,
	};
}
