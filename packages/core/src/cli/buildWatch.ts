import fs from 'node:fs';
import path from 'node:path';

export interface LoadedArborConfig<TArbor> {
	arbor: TArbor;
	dependencies: string[];
}

export interface BuildWatchOptions<TArbor> {
	configPath: string;
	outputPath: string;
	loadArborConfig(configPath: string): Promise<LoadedArborConfig<TArbor>>;
	generateStylesheet(arbor: TArbor): string | Promise<string>;
	debounceMs?: number;
}

export async function startBuildWatch<TArbor>({
	configPath,
	outputPath,
	loadArborConfig,
	generateStylesheet,
	debounceMs = 50,
}: BuildWatchOptions<TArbor>) {
	const watchers = new Map<string, fs.FSWatcher>();
	let isBuilding = false;
	let hasQueuedBuild = false;
	let rebuildTimer: NodeJS.Timeout | undefined;

	const queueBuild = (reason: string) => {
		if (rebuildTimer) {
			clearTimeout(rebuildTimer);
		}
		rebuildTimer = setTimeout(() => {
			void buildAndWatch(reason);
		}, debounceMs);
	};

	const closeAllWatchers = () => {
		for (const watcher of watchers.values()) {
			watcher.close();
		}
		watchers.clear();
	};

	const syncWatchers = (dependencies: string[]) => {
		const nextPaths = new Set(dependencies.map((dep) => path.resolve(dep)));

		for (const [filePath, watcher] of watchers) {
			if (!nextPaths.has(filePath)) {
				watcher.close();
				watchers.delete(filePath);
			}
		}

		for (const filePath of nextPaths) {
			if (watchers.has(filePath)) {
				continue;
			}

			try {
				const watcher = fs.watch(filePath, () => {
					const relativePath =
						path.relative(process.cwd(), filePath) || filePath;
					queueBuild(`change detected in ${relativePath}`);
				});

				watcher.on('error', (error) => {
					console.error(
						`Watcher error for ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
					);
					queueBuild(`watcher error in ${filePath}`);
				});

				watchers.set(filePath, watcher);
			} catch (error) {
				console.error(
					`Failed to watch ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		}
	};

	const buildAndWatch = async (reason: string) => {
		if (isBuilding) {
			hasQueuedBuild = true;
			return;
		}

		isBuilding = true;
		const startTime = Date.now();
		try {
			console.log(`Building (${reason}) with config: ${configPath}`);
			const { arbor, dependencies } = await loadArborConfig(configPath);
			const content = await generateStylesheet(arbor);
			await fs.promises.writeFile(outputPath, content, 'utf-8');
			console.log(`Stylesheet written to ${outputPath}`);
			syncWatchers(dependencies);
			console.log(`Watching ${watchers.size} file(s) for config changes...`);
		} catch (error) {
			console.error(error instanceof Error ? error.message : String(error));
		} finally {
			const endTime = Date.now();
			const duration = ((endTime - startTime) / 1000).toFixed(2);
			console.log(`Build completed in ${duration} seconds.`);
			isBuilding = false;

			if (hasQueuedBuild) {
				hasQueuedBuild = false;
				void buildAndWatch('queued config change');
			}
		}
	};

	syncWatchers([configPath]);
	await buildAndWatch('initial');
	console.log('Watch mode enabled. Press Ctrl+C to stop.');

	const stopWatching = () => {
		if (rebuildTimer) {
			clearTimeout(rebuildTimer);
		}
		closeAllWatchers();
		process.exit(0);
	};

	process.on('SIGINT', stopWatching);
	process.on('SIGTERM', stopWatching);
}
