#!/usr/bin/node
/// <reference types="node" />

import { createJiti } from 'jiti';
import fs from 'node:fs';
import path from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { generateStylesheet } from '../stylesheet/generateStylesheet.js';

const jiti = createJiti(import.meta.url);

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
			console.log('Building with config:', argv.config);
			console.log('Output file:', argv.output);
			const arborModule: any = await jiti.import(
				path.join(process.cwd(), argv.config || 'arbor.config.ts'),
			);
			const arbor = arborModule.default ?? arborModule.arbor;
			if (!arbor) {
				console.error(
					'Error: Configuration file must export a default Arbor config object.',
				);
				process.exit(1);
			}
			const content = await generateStylesheet(arbor);
			if (argv.output) {
				await fs.promises.writeFile(argv.output, content, 'utf-8');
				console.log(`Stylesheet written to ${argv.output}`);
			} else {
				console.log(content);
			}
		},
	)
	.demandCommand(1, 'You need to specify a command')
	.help()
	.parse();
