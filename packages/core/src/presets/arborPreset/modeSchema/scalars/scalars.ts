import { createModeSchema } from '@arbor-css/modes';

export const scalars = createModeSchema({
	density: {
		purpose: 'scalar',
		description:
			'A scaling factor for density. Higher density means smaller, tighter spacing and size',
	},
});
