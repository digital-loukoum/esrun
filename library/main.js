import Runner from "./runners/Runner.js";
import Watcher from "./runners/Watcher.js";
/**
 * Run any .ts or .js file
 */
export default async function esrun(inputFile, args = [], watch = false, inspect = false) {
    return new (watch ? Watcher : Runner)(inputFile, args, inspect).run();
}
