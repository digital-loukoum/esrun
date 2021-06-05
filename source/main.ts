import Runner from "./runners/Runner"
import Watcher from "./runners/Watcher"
import Inspector from "./runners/Inspector"
import type { Mode } from "./Mode"

/**
 * Run any .ts or .js file
 */
export default async function esrun(
	inputFile: string,
	args: string[] = [],
	mode: Mode = "default"
) {
	const runner = {
		default: Runner,
		watch: Watcher,
		inspect: Inspector,
	}[mode]
	return new runner(inputFile, args).run()
}
