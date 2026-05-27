#!/usr/bin/node
/// <reference types="node" />

import { createJiti } from 'jiti';
import fs from 'node:fs';
import path from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { generateStylesheet } from '../stylesheet/generateStylesheet.js';
import {
	createPrefixValidationConfig,
	createTokenMap,
	validateCssContent,
} from './validate.js';

const jiti = createJiti(import.meta.url);

async function loadArborConfig(configPath: string) {
	const arborModule: any = await jiti.import(configPath);
	const arbor = arborModule.default ?? arborModule.arbor ?? arborModule;
	if (!arbor || typeof arbor !== 'object' || !('$' in arbor)) {
		throw new Error(
			'Configuration file must export an Arbor preset object as default export.',
		);
	}
	return arbor;
}

const CSS_EXTENSIONS = new Set(['.css', '.scss', '.less']);
const SKIPPED_DIRECTORIES = new Set([
	'.git',
	'node_modules',
	'dist',
	'.next',
	'.astro',
]);

async function collectCssFiles(rootDir: string): Promise<string[]> {
	const files: string[] = [];

	async function walk(currentDir: string): Promise<void> {
		const entries = await fs.promises.readdir(currentDir, {
			withFileTypes: true,
		});
		for (const entry of entries) {
			const entryPath = path.join(currentDir, entry.name);
			if (entry.isDirectory()) {
				if (SKIPPED_DIRECTORIES.has(entry.name)) {
					continue;
				}
				await walk(entryPath);
				continue;
			}

			if (!entry.isFile()) {
				continue;
			}

			if (CSS_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
				files.push(entryPath);
			}
		}
	}

	await walk(rootDir);
	return files;
}

yargs(hideBin(process.argv))
	.command(
		'build',
		'Build your CSS',
		(y) =>
			y
				.option('config', {
					alias: 'c',
					type: 'string',
					description: 'Path to the configuration file',
				})
				.option('output', {
					alias: 'o',
					type: 'string',
					description: 'Path to the output file',
				}),
		async (argv) => {
			try {
				console.log('Building with config:', argv.config);
				console.log('Output file:', argv.output);
				const resolvedConfigPath = path.join(
					process.cwd(),
					argv.config || 'arbor.config.ts',
				);
				const arbor = await loadArborConfig(resolvedConfigPath);
				const content = await generateStylesheet(arbor);
				if (argv.output) {
					await fs.promises.writeFile(argv.output, content, 'utf-8');
					console.log(`Stylesheet written to ${argv.output}`);
				} else {
					console.log(content);
				}
			} catch (error) {
				console.error(
					error instanceof Error ? error.message : String(error),
				);
				process.exit(1);
			}
		},
	)
	.command(
		'validate [files...]',
		'Validate Arbor-prefixed CSS declarations, function calls, and @apply mixins',
		(y) =>
			y
				.positional('files', {
					type: 'string',
					array: true,
					default: [],
					description: 'CSS files to validate',
				})
				.option('config', {
					alias: 'c',
					type: 'string',
					description: 'Path to the configuration file',
				}),
		async (argv) => {
			try {
				const providedFiles = (argv.files as string[]) ?? [];
				const files =
					providedFiles.length > 0 ?
						providedFiles.map((file) =>
							path.isAbsolute(file) ? file : path.join(process.cwd(), file),
						)
					: 	await collectCssFiles(process.cwd());

				if (files.length === 0) {
					console.error('No CSS files found to validate.');
					process.exit(1);
				}

				const resolvedConfigPath = path.join(
					process.cwd(),
					argv.config || 'arbor.config.ts',
				);
				const arbor = await loadArborConfig(resolvedConfigPath);
				const tokenMap = createTokenMap(arbor);
				const prefixConfig = createPrefixValidationConfig(
					arbor.context.tokenPrefixes,
				);

				let totalIssues = 0;

				for (const filePath of files) {
					const displayPath = path.relative(process.cwd(), filePath) || filePath;
					let cssContent = '';
					try {
						cssContent = await fs.promises.readFile(filePath, 'utf-8');
					} catch (error) {
						console.error(
							`ERROR ${displayPath}: ${error instanceof Error ? error.message : String(error)}`,
						);
						totalIssues += 1;
						continue;
					}

					const issues = validateCssContent({
						content: cssContent,
						tokenMap,
						prefixConfig,
					});

					if (issues.length === 0) {
						console.log(`OK ${displayPath}`);
						continue;
					}

					console.error(`ERROR ${displayPath}`);
					for (const issue of issues) {
						console.error(`  ${issue.line}:${issue.column} ${issue.message}`);
					}
					totalIssues += issues.length;
				}

				if (totalIssues > 0) {
					console.error(`Validation failed with ${totalIssues} issue(s).`);
					process.exit(1);
				}

				console.log(`Validation passed for ${files.length} file(s).`);
			} catch (error) {
				console.error(
					error instanceof Error ? error.message : String(error),
				);
				process.exit(1);
			}
		},
	)
	.demandCommand(1, 'You need to specify a command')
	.help()
	.parse();
