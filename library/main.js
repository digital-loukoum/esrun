import Runner from "./runners/Runner.js";
import Watcher from "./runners/Watcher.js";
import Inspector from "./runners/Inspector.js";
/**
 * Run any .ts or .js file
 */
export default async function esrun(inputFile, args = [], mode = "default") {
    const runner = {
        default: Runner,
        watch: Watcher,
        inspect: Inspector,
    }[mode];
    return new runner(inputFile, args).run();
}
