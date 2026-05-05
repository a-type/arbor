import {
	Variant,
	VariantContext,
	VariantHandler,
	VariantHandlerContext,
} from 'unocss';
import { expect } from 'vitest';
import { testTheme } from '../_test.js';

export async function testVariants(
	variants: Variant<any>[],
	input: string,
	remainingString: string,
	expectedModifications: Partial<VariantHandlerContext>,
) {
	let match: {
		variant: Variant<any>;
		handler: string | VariantHandler | VariantHandler[];
	} | null = null;
	for (const variant of variants.toReversed()) {
		const startingContext: VariantContext = {
			generator: {
				config: {
					separators: [':'],
				},
			} as any,
			rawSelector: '',
			theme: testTheme,
		};
		if (typeof variant === 'object') {
			const result = await variant.match(input, startingContext);
			if (result) {
				match = { variant, handler: result };
			}
		}
	}

	expect(match, 'No variants matched').not.toBeNull();

	if (match) {
		const initialCtx: VariantHandlerContext = {
			entries: [],
			prefix: '',
			pseudo: '',
			selector: '',
		};
		let inputCtx: VariantHandlerContext = {
			...initialCtx,
		};
		const { handler } = match;
		if (typeof handler === 'string') {
			expect(handler).toBe(remainingString);
		} else {
			const handlers = Array.isArray(handler) ? handler : [handler];
			for (const h of handlers) {
				await h.handle?.(inputCtx, (next) => {
					Object.assign(inputCtx, next);
					return inputCtx;
				});
			}
			expect(inputCtx).toEqual({
				...initialCtx,
				...expectedModifications,
			});
		}
	}
}
