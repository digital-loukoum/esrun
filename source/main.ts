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
	return new (watch ? Watcher : Runner)(inputFile, args, inspect).run()
}
