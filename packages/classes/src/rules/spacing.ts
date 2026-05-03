import { Rule } from 'unocss';
import { Theme } from '../theme/types.js';

export const spacingRules: Rule<Theme>[] = [
	[
		/^m-(.+)$/,
		([, d], { theme }) => {
			const value = theme.spacing?.[d] || d;
			return {
				margin: value,
			};
		},
	],
	[
		/^mt-(.+)$/,
		([, d], { theme }) => {
			const value = theme.spacing?.[d] || d;
			return {
				'margin-top': value,
			};
		},
	],
	[
		/^mr-(.+)$/,
		([, d], { theme }) => {
			const value = theme.spacing?.[d] || d;
			return {
				'margin-right': value,
			};
		},
	],
	[
		/^mb-(.+)$/,
		([, d], { theme }) => {
			const value = theme.spacing?.[d] || d;
			return {
				'margin-bottom': value,
			};
		},
	],
	[
		/^ml-(.+)$/,
		([, d], { theme }) => {
			const value = theme.spacing?.[d] || d;
			return {
				'margin-left': value,
			};
		},
	],
	[
		/^p-(.+)$/,
		([, d], { theme }) => {
			const value = theme.spacing?.[d] || d;
			return {
				padding: value,
			};
		},
	],
	[
		/^pt-(.+)$/,
		([, d], { theme }) => {
			const value = theme.spacing?.[d] || d;
			return {
				'padding-top': value,
			};
		},
	],
	[
		/^pr-(.+)$/,
		([, d], { theme }) => {
			const value = theme.spacing?.[d] || d;
			return {
				'padding-right': value,
			};
		},
	],
	[
		/^pb-(.+)$/,
		([, d], { theme }) => {
			const value = theme.spacing?.[d] || d;
			return {
				'padding-bottom': value,
			};
		},
	],
	[
		/^pl-(.+)$/,
		([, d], { theme }) => {
			const value = theme.spacing?.[d] || d;
			return {
				'padding-left': value,
			};
		},
	],
	[
		/^gap-(.+)$/,
		([, d], { theme }) => {
			const value = theme.spacing?.[d] || d;
			return {
				gap: value,
			};
		},
	],
	[
		/^row-gap-(.+)$/,
		([, d], { theme }) => {
			const value = theme.spacing?.[d] || d;
			return {
				'row-gap': value,
			};
		},
	],
	[
		/^col-gap-(.+)$/,
		([, d], { theme }) => {
			const value = theme.spacing?.[d] || d;
			return {
				'column-gap': value,
			};
		},
	],
];
