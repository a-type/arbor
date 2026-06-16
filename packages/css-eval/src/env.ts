import type {
	CustomAtRules,
	transform as transformFn,
	TransformOptions,
} from 'lightningcss';

export type EnvTransformOptions<C extends CustomAtRules> = Omit<
	TransformOptions<C>,
	'code'
> & {
	code: string;
};
export type EnvTransformResult<C extends CustomAtRules> = Omit<
	Awaited<ReturnType<typeof transformFn<C>>>,
	'code'
> & {
	code: string;
};

export interface EnvTransform<C extends CustomAtRules> {
	(options: EnvTransformOptions<C>): Promise<EnvTransformResult<C>>;
}

export async function getBrowserEnv<C extends CustomAtRules>(): Promise<
	EnvTransform<C>
> {
	const transform = await import('https://esm.run/lightningcss-wasm');
	return async (options: EnvTransformOptions<any>) => {
		const result = await transform({
			...options,
			code: new TextEncoder().encode(options.code),
		});
		return {
			...result,
			code: new TextDecoder().decode(result.code),
		};
	};
}

export async function getNodeEnv<C extends CustomAtRules>(): Promise<
	EnvTransform<C>
> {
	const { transform } = await import('lightningcss');
	return async (options: EnvTransformOptions<C>) => {
		const result = transform({
			...options,
			code: new TextEncoder().encode(options.code),
		});
		return {
			...result,
			code: new TextDecoder().decode(result.code),
		};
	};
}

export async function getAutoEnv<C extends CustomAtRules>(): Promise<
	EnvTransform<C>
> {
	if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
		console.debug('Using browser environment for CSS evaluation');
		return getBrowserEnv();
	} else {
		console.debug('Using Node environment for CSS evaluation');
		return getNodeEnv();
	}
}
