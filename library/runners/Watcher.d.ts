import Runner from "./Runner.js";
import type { FSWatcher } from "chokidar/index.js";
export default class Watcher extends Runner {
    protected watcher: FSWatcher | null;
    protected watch: boolean;
    protected inspect: boolean;
    run(): Promise<void>;
    rerun(): Promise<void>;
    rebuild(): Promise<void>;
}
