import Runner from "./runners/Runner.js"
import Watcher from "./runners/Watcher.js"
import { Options } from "./types/Options.js"

export { Runner, Watcher, esrun, Options }

/**
 * Run any .ts or .js file
 */
export default async function esrun(inputFile: string, options?: Options) {
	if (options?.watch && options?.inspect) {
		console.warn(
			`--inspect and --watch options are not compatible together. Disabling watch mode.`
		)
		options.watch = false
	}
	return new (options?.watch ? Watcher : Runner)(inputFile, options).run()
}
