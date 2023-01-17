import Runner, { BuildOutput } from "./Runner.js";
import { watch } from "chokidar";
import type { FSWatcher } from "chokidar";
import { posix } from "path";
import { Options } from "../types/Options.js";

function debounce(func: Function, wait: number) {
	let timeout: NodeJS.Timeout | null = null;

	return function (...parameters: unknown[]) {
		if (timeout) clearTimeout(timeout);
		else func(...parameters);
		timeout = setTimeout(() => (timeout = null), wait);
	};
}

export default class Watcher extends Runner {
	protected watcher: FSWatcher | null = null;
	protected watched: string[] = [];

	constructor(input: string, options?: Options) {
		super(input, options);
		this.watched =
			options?.watch instanceof Array
				? options.watch.map((glob) => posix.resolve(glob))
				: [];
	}

	async run() {
		try {
			console.clear();
			await this.build();
			this.execute();
			this.watch();
		} catch (error) {}
	}

	async rerun() {
		if (!this.watcher) throw "Cannot re-run before a first run";

		if (this.childProcess) {
			this.childProcess?.kill("SIGINT");
			this.childProcess = undefined;
		}
		await this.rebuild();

		// we update the list of watched files
		if (this.buildOutput) {
			this.watch();
		}

		await this.execute();
	}

	async rebuild() {
		if (!this.preserveConsole) {
			console.clear();
		}
		this.dependencies.length = 0;

		if (this.buildOutput) {
			try {
				this.buildOutput = (await this.buildOutput.rebuild!()) as BuildOutput;
				this.outputCode = this.buildOutput?.outputFiles[0]?.text || "";
				this.dependencies = this.retrieveDependencies();
			} catch (error) {
				this.buildOutput = null;
				this.outputCode = "";
			}
		} else {
			await this.build();
		}
	}

	watch() {
		void this.watcher?.close();
		this.watcher = watch([
			...this.dependencies,
			"package.json",
			...this.watched,
		]);
		this.watcher.on("change", debounce(this.rerun.bind(this), 300));
		this.watcher.on("unlink", debounce(this.rerun.bind(this), 300));
	}
}
