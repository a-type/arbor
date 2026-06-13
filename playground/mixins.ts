import { CreateMixin } from '@arbor-css/core';

export function makeMixins(create: CreateMixin) {
	return {
		foo: create('foo', {
			definition: () => ({
				color: 'red',
			}),
		}),
		bar: create('bar', {
			definition: () => ({
				color: 'blue',
			}),
		}),
		// qux: create('qux', {
		// 	definition: () => ({
		// 		color: 'green',
		// 	}),
		// }),
		baz: create('baz', {
			definition: () => ({
				color: 'yellow',
			}),
		}),
	};
}
