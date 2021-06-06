import Runner from "./runners/Runner"
import Watcher from "./runners/Watcher"

/**
 * Run any .ts or .js file
 */
export default async function esrun(
	inputFile: string,
	args: string[] = [],
	watch = false,
	inspect = false
) {
	if (watch && inspect) {
		console.warn(
			`--inspect and --watch options are not compatible together. Disabling watch mode.`
		)
		watch = false
	}
	return new (watch ? Watcher : Runner)(inputFile, args, inspect).run()
}
