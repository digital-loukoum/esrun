import Runner from "./Runner.js";
import { watch } from "chokidar/index.js";
import path from "path";
export default class Watcher extends Runner {
    constructor() {
        super(...arguments);
        this.watcher = null;
    }
    get mode() {
        return "watch";
    }
    async run() {
        try {
            console.clear();
            await this.build();
            this.execute();
            this.watcher = watch([...this.dependencies, "package.json"]);
            this.watcher.on("change", this.rerun.bind(this));
            this.watcher.on("unlink", this.rerun.bind(this));
        }
        catch (error) { }
    }
    async rerun() {
        console.log("RERUN");
        if (!this.watcher)
            throw `Cannot re-run before a first run`;
        const { watcher } = this;
        await this.rebuild();
        this.execute();
        // we update the list of watched files
        if (this.output) {
            const watchedDependencies = [];
            for (const [directory, files] of Object.entries(watcher.getWatched())) {
                watchedDependencies.push(...files.map(file => path.join(directory, file)));
            }
            for (const dependency of watchedDependencies)
                if (dependency != "package.json" && !this.dependencies.includes(dependency))
                    watcher.unwatch(dependency);
            for (const dependency of this.dependencies)
                if (!watchedDependencies.includes(dependency))
                    watcher.add(dependency);
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
