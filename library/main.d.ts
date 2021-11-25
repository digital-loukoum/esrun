import Runner from "./runners/Runner.js";
import Watcher from "./runners/Watcher.js";
export { Runner, Watcher, esrun };
/**
 * Run any .ts or .js file
 */
export default function esrun(inputFile: string, args?: string[], watch?: boolean | string[], inspect?: boolean): Promise<void>;
