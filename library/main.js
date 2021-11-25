import Runner from "./runners/Runner.js";
import Watcher from "./runners/Watcher.js";
export { Runner, Watcher, esrun };
/**
 * Run any .ts or .js file
 */
export default async function esrun(inputFile, args = [], watch = false, inspect = false) {
    if (watch && inspect) {
        console.warn(`--inspect and --watch options are not compatible together. Disabling watch mode.`);
        watch = false;
    }
    return new (watch ? Watcher : Runner)(inputFile, args, watch, inspect).run();
}
