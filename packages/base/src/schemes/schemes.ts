import { ColorRangeConfig, ColorRangeItem } from '../core/ranges.js';

export interface SchemeDefinition {
	getColorRange: (
		config: Pick<ColorRangeConfig, 'sourceHue' | 'context' | 'rangeNames'>,
	) => ColorRangeItem[];
	tag: string;
}

export function createScheme(def: SchemeDefinition) {
	return def;
}
