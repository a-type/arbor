/**
 * It's easier to load the runtime browser version of Lightning
 * from a CDN... so I'm hijacking their NPM version for correct
 * typings.
 */
declare module 'https://esm.run/lightningcss-wasm' {
	import init, { transform } from 'lightningcss-wasm';
	export { transform };
	export default init;
}
