import { createProp, PropertyDefinition } from '../core/properties';

export interface PrimitiveGlobals {
	saturation: number;
}

export const defaultGlobals: PrimitiveGlobals = {
	saturation: 0.5,
};

export function createGlobalProps(
	config: Partial<PrimitiveGlobals>,
): GlobalConfigProps {
	return {
		saturation: createProp('🧑-sat', {
			type: 'number',
			fallback: config.saturation,
		}),
	};
}

export type GlobalConfigProps = {
	[K in keyof PrimitiveGlobals]: PropertyDefinition;
};
