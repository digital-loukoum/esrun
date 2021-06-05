import type { Mode } from "./Mode.js";
/**
 * Run any .ts or .js file
 */
export default function esrun(inputFile: string, args?: string[], mode?: Mode): Promise<void>;
