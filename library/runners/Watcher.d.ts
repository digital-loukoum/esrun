import Runner from "./Runner.js";
import type { FSWatcher } from "chokidar/index.js";
export default class Watcher extends Runner {
    args: string[];
    protected watch: string[];
    protected inspect: boolean;
    protected watcher: FSWatcher | null;
    constructor(input: string, args?: string[], watch?: string[], inspect?: boolean);
    run(): Promise<void>;
    rerun(): Promise<void>;
    rebuild(): Promise<void>;
}
