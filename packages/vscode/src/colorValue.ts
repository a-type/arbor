export interface RgbaColor {
	red: number;
	green: number;
	blue: number;
	alpha: number;
}

export function parseCssColor(value: string): RgbaColor | null {
	const trimmed = value.trim();

	return (
		parseHexColor(trimmed) ??
		parseRgbColor(trimmed) ??
		parseHslColor(trimmed) ??
		parseOklchColor(trimmed)
	);
}

function parseHexColor(value: string): RgbaColor | null {
	const match = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/iu.exec(value);
	if (!match) {
		return null;
	}

	const hex = match[1];
	const normalized =
		hex.length === 3 || hex.length === 4 ?
			hex
				.split('')
				.map((part) => part + part)
				.join('')
		:	hex;

	const alphaHex = normalized.length === 8 ? normalized.slice(6, 8) : 'ff';

	return {
		red: parseInt(normalized.slice(0, 2), 16) / 255,
		green: parseInt(normalized.slice(2, 4), 16) / 255,
		blue: parseInt(normalized.slice(4, 6), 16) / 255,
		alpha: parseInt(alphaHex, 16) / 255,
	};
}

function parseRgbColor(value: string): RgbaColor | null {
	const match = /^rgba?\((.*)\)$/iu.exec(value);
	if (!match) {
		return null;
	}

	const [colorPart, alphaPart] = splitAlpha(match[1]);
	const components = splitComponents(colorPart);
	const rgbComponents =
		components.length === 4 && alphaPart === undefined ?
			components.slice(0, 3)
		:	components;
	const explicitAlpha =
		components.length === 4 && alphaPart === undefined ?
			components[3]
		:	alphaPart;

	if (rgbComponents.length !== 3) {
		return null;
	}

	const red = parseRgbChannel(rgbComponents[0]);
	const green = parseRgbChannel(rgbComponents[1]);
	const blue = parseRgbChannel(rgbComponents[2]);
	const alpha = explicitAlpha ? parseAlpha(explicitAlpha) : 1;

	if (red === null || green === null || blue === null || alpha === null) {
		return null;
	}

	return { red, green, blue, alpha };
}

function parseHslColor(value: string): RgbaColor | null {
	const match = /^hsla?\((.*)\)$/iu.exec(value);
	if (!match) {
		return null;
	}

	const [colorPart, alphaPart] = splitAlpha(match[1]);
	const components = splitComponents(colorPart);
	const hslComponents =
		components.length === 4 && alphaPart === undefined ?
			components.slice(0, 3)
		:	components;
	const explicitAlpha =
		components.length === 4 && alphaPart === undefined ?
			components[3]
		:	alphaPart;

	if (hslComponents.length !== 3) {
		return null;
	}

	const hue = parseHue(hslComponents[0]);
	const saturation = parsePercentage(hslComponents[1]);
	const lightness = parsePercentage(hslComponents[2]);
	const alpha = explicitAlpha ? parseAlpha(explicitAlpha) : 1;

	if (
		hue === null ||
		saturation === null ||
		lightness === null ||
		alpha === null
	) {
		return null;
	}

	const { red, green, blue } = hslToRgb(hue, saturation, lightness);
	return { red, green, blue, alpha };
}

function parseOklchColor(value: string): RgbaColor | null {
	const match = /^oklch\((.*)\)$/iu.exec(value);
	if (!match) {
		return null;
	}

	const [colorPart, alphaPart] = splitAlpha(match[1]);
	const components = splitComponents(colorPart);
	if (components.length !== 3) {
		return null;
	}

	const lightness = parseOklchLightness(components[0]);
	const chroma = parseNumber(components[1]);
	const hue = parseHue(components[2]);
	const alpha = alphaPart ? parseAlpha(alphaPart) : 1;

	if (
		lightness === null ||
		chroma === null ||
		hue === null ||
		alpha === null
	) {
		return null;
	}

	const hueRadians = (hue * Math.PI) / 180;
	const a = chroma * Math.cos(hueRadians);
	const b = chroma * Math.sin(hueRadians);

	const l = lightness + 0.3963377774 * a + 0.2158037573 * b;
	const m = lightness - 0.1055613458 * a - 0.0638541728 * b;
	const s = lightness - 0.0894841775 * a - 1.291485548 * b;

	const l3 = l ** 3;
	const m3 = m ** 3;
	const s3 = s ** 3;

	const redLinear = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
	const greenLinear =
		-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
	const blueLinear =
		-0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

	return {
		red: clamp01(linearSrgbToSrgb(redLinear)),
		green: clamp01(linearSrgbToSrgb(greenLinear)),
		blue: clamp01(linearSrgbToSrgb(blueLinear)),
		alpha,
	};
}

function splitAlpha(value: string): [string, string | undefined] {
	const parts = value.split('/');
	if (parts.length === 1) {
		return [value.trim(), undefined];
	}

	if (parts.length !== 2) {
		return [value.trim(), undefined];
	}

	return [parts[0].trim(), parts[1].trim()];
}

function splitComponents(value: string): string[] {
	return (
		value.includes(',') ?
			value.split(',')
		:	value.split(/\s+/u)
	)
		.map((part) => part.trim())
		.filter(Boolean);
}

function parseRgbChannel(value: string): number | null {
	if (value.endsWith('%')) {
		const parsed = parseNumber(value.slice(0, -1));
		return parsed === null ? null : clamp01(parsed / 100);
	}

	const parsed = parseNumber(value);
	return parsed === null ? null : clamp01(parsed / 255);
}

function parsePercentage(value: string): number | null {
	if (!value.endsWith('%')) {
		return null;
	}

	const parsed = parseNumber(value.slice(0, -1));
	return parsed === null ? null : clamp01(parsed / 100);
}

function parseOklchLightness(value: string): number | null {
	if (value.endsWith('%')) {
		return parsePercentage(value);
	}

	return parseNumber(value);
}

function parseAlpha(value: string): number | null {
	if (value.endsWith('%')) {
		return parsePercentage(value);
	}

	const parsed = parseNumber(value);
	return parsed === null ? null : clamp01(parsed);
}

function parseHue(value: string): number | null {
	const parsed = parseNumber(value.replace(/(?:deg|grad|rad|turn)$/u, ''));
	if (parsed === null) {
		return null;
	}

	if (value.endsWith('turn')) {
		return normalizeHue(parsed * 360);
	}

	if (value.endsWith('grad')) {
		return normalizeHue(parsed * 0.9);
	}

	if (value.endsWith('rad')) {
		return normalizeHue((parsed * 180) / Math.PI);
	}

	return normalizeHue(parsed);
}

function parseNumber(value: string): number | null {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function normalizeHue(value: number): number {
	return ((value % 360) + 360) % 360;
}

function hslToRgb(hue: number, saturation: number, lightness: number) {
	if (saturation === 0) {
		return { red: lightness, green: lightness, blue: lightness };
	}

	const q =
		lightness < 0.5 ?
			lightness * (1 + saturation)
		:	lightness + saturation - lightness * saturation;
	const p = 2 * lightness - q;
	const hk = hue / 360;

	return {
		red: hueToRgb(p, q, hk + 1 / 3),
		green: hueToRgb(p, q, hk),
		blue: hueToRgb(p, q, hk - 1 / 3),
	};
}

function hueToRgb(p: number, q: number, t: number): number {
	let normalized = t;
	if (normalized < 0) {
		normalized += 1;
	}
	if (normalized > 1) {
		normalized -= 1;
	}
	if (normalized < 1 / 6) {
		return p + (q - p) * 6 * normalized;
	}
	if (normalized < 1 / 2) {
		return q;
	}
	if (normalized < 2 / 3) {
		return p + (q - p) * (2 / 3 - normalized) * 6;
	}

	return p;
}

function linearSrgbToSrgb(value: number): number {
	return value <= 0.0031308 ?
			12.92 * value
		:	1.055 * Math.pow(value, 1 / 2.4) - 0.055;
}

function clamp01(value: number): number {
	return Math.min(1, Math.max(0, value));
}
