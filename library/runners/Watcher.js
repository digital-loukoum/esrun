import Runner from "./Runner.js";
import { watch } from "chokidar/index.js";
import path from "path";
import anymatch from "anymatch/index.js";
function debounce(func, wait) {
    let timeout = null;
    return function (..._) {
        if (timeout)
            clearTimeout(timeout);
        else
            func(...arguments);
        timeout = setTimeout(() => (timeout = null), wait);
    };
}
export default class Watcher extends Runner {
    constructor(input, args = [], watch = [], inspect = false) {
        super(input, args);
        this.args = args;
        this.watch = watch;
        this.inspect = inspect;
        this.watcher = null;
        this.watch = watch instanceof Array ? this.watch.map(glob => path.resolve(glob)) : [];
    }
    async run() {
        try {
            console.clear();
            await this.build();
            this.execute();
            this.watcher = watch([...this.dependencies, "package.json", ...this.watch]);
            this.watcher.on("change", debounce(this.rerun.bind(this), 300));
            this.watcher.on("unlink", debounce(this.rerun.bind(this), 300));
        }
        catch (error) { }
    }
    async rerun() {
        if (!this.watcher)
            throw `Cannot re-run before a first run`;
        const { watcher } = this;
        if (this.childProcess) {
            this.childProcess?.kill("SIGINT");
            this.childProcess = undefined;
        }
        await this.rebuild();
        this.execute();
        // we update the list of watched files
        if (this.output) {
            const packageFile = path.resolve("package.json");
            const watchedDependencies = [];
            for (const [directory, files] of Object.entries(watcher.getWatched())) {
                watchedDependencies.push(...files.map(file => path.join(directory, file)));
            }
            for (const dependency of watchedDependencies) {
                if (dependency != packageFile &&
                    !anymatch(this.watch, dependency) &&
                    !this.dependencies.includes(dependency)) {
                    watcher.unwatch(dependency);
                }
            }
            for (const dependency of this.dependencies)
                if (!watchedDependencies.includes(dependency)) {
                    watcher.add(dependency);
                }
        }
    }
    async rebuild() {
        console.clear();
        this.dependencies.length = 0;
        if (this.output) {
            try {
                this.output = (await this.output.rebuild());
            }
            catch (error) {
                this.output = null;
            }
        }
        else {
            await this.build();
        }
    }
}
