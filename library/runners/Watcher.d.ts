import Runner from "./Runner.js";
import type { FSWatcher } from "chokidar/index.js";
export default class Watcher extends Runner {
    args: string[];
    protected watch: never[];
    protected inspect: boolean;
    protected watcher: FSWatcher | null;
    constructor(input: string, args?: string[], watch?: never[], inspect?: boolean);
    run(): Promise<void>;
    rerun(): Promise<void>;
    rebuild(): Promise<void>;
}
