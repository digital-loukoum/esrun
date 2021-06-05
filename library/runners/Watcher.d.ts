import Runner from "./Runner.js";
import type { Mode } from "../Mode.js";
import type { FSWatcher } from "chokidar/index.js";
export default class Watcher extends Runner {
    protected watcher: FSWatcher | null;
    get mode(): Mode;
    run(): Promise<void>;
    rerun(): Promise<void>;
    rebuild(): Promise<void>;
}
