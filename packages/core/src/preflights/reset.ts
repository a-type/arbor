import { preflight } from './_util';

export const resetPreflight = preflight({
	getCSS: async () => `@layer reset {
	*, *::before, *::after {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		border: 0 solid;
	}
}
`,
});
