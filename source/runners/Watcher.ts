import Runner, { Output } from "./Runner"
import { watch } from "chokidar"
import type { FSWatcher } from "chokidar"
import path from "path"
import anymatch from "anymatch"

function debounce(func: Function, wait: number) {
	let timeout: NodeJS.Timeout | null = null

	return function(..._: any[]) {
		if (timeout) clearTimeout(timeout)
		else func(...arguments)
		timeout = setTimeout(() => (timeout = null), wait)
	}
}

export default class Watcher extends Runner {
	protected watcher: FSWatcher | null = null

	constructor(
		input: string,
		public args: string[] = [],
		protected watch: string[] = [],
		protected inspect: boolean = false
	) {
		super(input, args, watch instanceof Array ? watch : [], inspect)
		this.watch = this.watch.map(glob => path.resolve(glob))
	}

	async run() {
		try {
			console.clear()
			await this.build()
			this.execute()
			this.watcher = watch([...this.dependencies, "package.json", ...this.watch])
			this.watcher.on("change", debounce(this.rerun.bind(this), 300))
			this.watcher.on("unlink", debounce(this.rerun.bind(this), 300))
		} catch (error) {}
	}

	async rerun() {
		if (!this.watcher) throw `Cannot re-run before a first run`
		const { watcher } = this

		await this.rebuild()
		this.execute()

		// we update the list of watched files
		if (this.output) {
			const packageFile = path.resolve("package.json")
			const watchedDependencies = []
			for (const [directory, files] of Object.entries(watcher.getWatched())) {
				watchedDependencies.push(...files.map(file => path.join(directory, file)))
			}

			for (const dependency of watchedDependencies) {
				if (dependency != packageFile && !anymatch(this.watch, dependency) && !this.dependencies.includes(dependency)) {
					watcher.unwatch(dependency)
				}
			}

			for (const dependency of this.dependencies)
				if (!watchedDependencies.includes(dependency)) {
					watcher.add(dependency)
				}
		}
	}

	async rebuild() {
		console.clear()
		this.dependencies.length = 0
		if (this.output) {
			try {
				this.output = (await this.output.rebuild!()) as Output
			} catch (error) {
				this.output = null
			}
		} else {
			await this.build()
		}
	}
}
