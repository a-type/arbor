/// <reference types="node" />

import { createJiti } from 'jiti';
import fs from 'node:fs';
import { glob } from 'node:fs/promises';
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

const SKIPPED_DIRECTORIES = new Set([
	'.git',
	'node_modules',
	'dist',
	'.next',
	'.astro',
]);

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
				console.error(error instanceof Error ? error.message : String(error));
				process.exit(1);
			}
		},
	)
	.command(
		'validate [globs...]',
		'Validate Arbor-prefixed CSS declarations, function calls, and @apply mixins',
		(y) =>
			y
				.positional('globs', {
					type: 'string',
					array: true,
					default: ['**/*.{css,scss,less}'],
					description: 'CSS file globs to validate',
				})
				.option('config', {
					alias: 'c',
					type: 'string',
					description: 'Path to the configuration file',
				})
				.option('verbose', {
					alias: 'v',
					type: 'boolean',
					description: 'Enable verbose output',
				}),
		async (argv) => {
			try {
				const providedGlobs = (argv.globs as string[]) ?? [];

				const globsToSearch =
					providedGlobs.length > 0 ? providedGlobs : ['**/*.{css,scss,less}'];
				const globOptions = {
					cwd: process.cwd(),
					ignore: Array.from(SKIPPED_DIRECTORIES).map((dir) => `${dir}/**`),
					absolute: true,
				};

				const filesSet = new Set<string>();
				for (const globPattern of globsToSearch) {
					for await (const file of glob(globPattern, globOptions)) {
						filesSet.add(file);
					}
				}
				const files = Array.from(filesSet);

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
				if (argv.verbose) {
					console.log('Loaded Arbor configuration from:', resolvedConfigPath);
					console.log('Tokens:', [...tokenMap.keys()].join(', '));
				}
				const prefixConfig = createPrefixValidationConfig(
					arbor.context.tokenPrefixes,
				);

				let totalIssues = 0;

				for (const filePath of files) {
					const displayPath =
						path.relative(process.cwd(), filePath) || filePath;
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

					if (argv.verbose) {
						console.log('Validating content with the following prefixes:');
						console.log(
							`  Token prefixes: ${prefixConfig.tokenPrefixes.join(', ')}`,
						);
						console.log(
							`  Function name prefix: ${prefixConfig.functionNamePrefix}`,
						);
						console.log(`  Mixin name prefix: ${prefixConfig.mixinNamePrefix}`);
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
				console.error(error instanceof Error ? error.message : String(error));
				process.exit(1);
			}
		},
	)
	.demandCommand(1, 'You need to specify a command')
	.help()
	.parse();
