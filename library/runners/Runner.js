import { existsSync, statSync, readFileSync } from "fs";
import { resolve, basename } from "path";
import { build } from "esbuild/lib/main.js";
import addJsExtensions from "@digitak/grubber/library/utilities/addJsExtensions.js";
import resolveDependency from "../resolveDependency.js";
import { spawnSync } from "child_process";
export default class Runner {
    constructor(input, args = []) {
        this.args = args;
        this.output = null;
        this.dependencies = [];
        this.input = this.findInputFile(input);
    }
    get mode() {
        return "default";
    }
    get outputCode() {
        return this.output?.outputFiles[0]?.text || "";
    }
    async run() {
        try {
            await this.build();
            process.exit(this.execute());
        }
        catch (error) {
            console.error(error);
            process.exit(1);
        }
    }
    execute() {
        if (!this.output)
            return 1;
        let code = addJsExtensions(this.outputCode, resolveDependency);
        const commandArgs = [];
        if (this.mode == "inspect")
            commandArgs.push("--inspect");
        commandArgs.push("--input-type=module", "--eval", code.replace(/'/g, "\\'"), "--", this.input, ...this.args);
        try {
            const { status } = spawnSync("node", commandArgs, {
                stdio: "inherit",
            });
            return status || 0;
        }
        catch (error) {
            return 1;
        }
    }
    async build() {
        try {
            this.output = await build({
                entryPoints: [this.input],
                bundle: true,
                write: false,
                platform: "node",
                format: "esm",
                incremental: this.mode != "default",
                plugins: [
                    {
                        name: "make-all-packages-external",
                        setup: build => {
                            const filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/; // Must not start with "/" or "./" or "../"
                            build.onResolve({ filter }, args => {
                                return {
                                    path: args.path,
                                    external: true,
                                };
                            });
                        },
                    },
                    {
                        name: "list-dependencies",
                        setup: build => {
                            build.onLoad({ filter: /.*/ }, async ({ path }) => {
                                this.dependencies.push(path);
                                return null;
                            });
                        },
                    },
                ],
            });
        }
        catch (error) {
            this.output = null;
        }
    }
    findInputFile(path) {
        if (!existsSync(path)) {
            if (existsSync(`${path}.ts`))
                path = `${path}.ts`;
            else if (existsSync(`${path}.js`))
                path = `${path}.js`;
            else
                throw `Path '${path}' does not exist`;
        }
        const stat = statSync(path);
        if (stat.isFile())
            return path;
        else if (stat.isDirectory()) {
            // first we check if there is a package.json file with a `main` key
            const packageFile = resolve(path, "package.json");
            if (existsSync(packageFile) && statSync(packageFile).isFile()) {
                const { main } = JSON.parse(readFileSync(packageFile, "utf8"));
                if (main)
                    return this.findInputFile(resolve(path, main));
            }
            // otherwise we look for a default entry point
            const name = basename(path);
            for (const subpath of [
                resolve(path, "index.ts"),
                resolve(path, name),
                resolve(path, `${name}.ts`),
                resolve(path, "main.ts"),
                resolve(path, "index.js"),
                resolve(path, `${name}.js`),
                resolve(path, "main.js"),
            ])
                if (existsSync(subpath) && statSync(subpath).isFile())
                    return subpath;
            throw `Could not resolve an entry point in folder '${path}`;
        }
        else
            throw `Path '${path}' should be a file or a directory`;
    }
}
