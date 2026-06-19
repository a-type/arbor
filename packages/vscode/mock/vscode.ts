export const workspace = {
	getConfiguration: (section: string) => {
		if (section === 'arborCss') {
			return {
				get: (key: string) => undefined,
			};
		}
		return undefined;
	},
};
