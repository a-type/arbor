import { CreateMixin, css } from '@arbor-css/core';

export function makeMixins(create: CreateMixin) {
	return {
		foo: create('foo', {
			definition: () => css`
				color: red;
			`,
		}),
		bar: create('bar', {
			definition: () => css`
				color: blue;
			`,
		}),
		baz: create('baz', {
			definition: () => css`
				color: yellow;
			`,
		}),
	};
}
