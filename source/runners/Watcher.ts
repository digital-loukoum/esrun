import Runner, { Output } from "./Runner"
import { watch } from "chokidar"
import type { FSWatcher } from "chokidar"
import path from "path"

export default class Watcher extends Runner {
	protected watcher: FSWatcher | null = null
	protected watch = true
	protected inspect = false

	async run() {
		try {
			console.clear()
			await this.build()
			this.execute()
			this.watcher = watch([...this.dependencies, "package.json"])
			this.watcher.on("change", this.rerun.bind(this))
			this.watcher.on("unlink", this.rerun.bind(this))
		} catch (error) {}
	}

	async rerun() {
		if (!this.watcher) throw `Cannot re-run before a first run`
		const { watcher } = this

		await this.rebuild()
		this.execute()

		// we update the list of watched files
		if (this.output) {
			const watchedDependencies = []
			for (const [directory, files] of Object.entries(watcher.getWatched())) {
				watchedDependencies.push(...files.map(file => path.join(directory, file)))
			}

			for (const dependency of watchedDependencies)
				if (dependency != "package.json" && !this.dependencies.includes(dependency))
					watcher.unwatch(dependency)

			for (const dependency of this.dependencies)
				if (!watchedDependencies.includes(dependency)) watcher.add(dependency)
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
