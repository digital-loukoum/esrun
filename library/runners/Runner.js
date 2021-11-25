import { build } from "esbuild/lib/main.js";
import addJsExtensions from "@digitak/grubber/library/utilities/addJsExtensions.js";
import resolveDependency from "../tools/resolveDependency.js";
import { spawn } from "child_process";
import findInputFile from "../tools/findInputFile.js";
export default class Runner {
    constructor(input, args = [], watch = false, inspect = false) {
        this.args = args;
        this.watch = watch;
        this.inspect = inspect;
        this.output = null;
        this.dependencies = [];
        this.input = findInputFile(input);
    }
    get outputCode() {
        return this.output?.outputFiles[0]?.text || "";
    }
    async run() {
        try {
            await this.build();
            process.exit(await this.execute());
        }
        catch (error) {
            console.error(error);
            process.exit(1);
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
                incremental: !!this.watch,
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
    async transform(transformer) {
        if (!this.output?.outputFiles[0])
            return;
        this.output.outputFiles[0].text = await transformer(this.output.outputFiles[0].text);
    }
    async execute() {
        if (!this.output)
            return 1;
        let code = addJsExtensions(this.outputCode, resolveDependency);
        const commandArgs = [];
        if (this.inspect) {
            commandArgs.push("--inspect");
            code = `setTimeout(() => console.log("Process timeout"), 3_600_000);` + code;
        }
        commandArgs.push("--input-type=module", "--eval", code.replace(/'/g, "\\'"), "--", this.input, ...this.args);
        try {
            this.childProcess = spawn("node", commandArgs, {
                stdio: "inherit",
            });
            // child.stdout.on("data", data => console.log(data.toString()))
            // child.stderr.on("data", data => console.error(data.toString()))
            return new Promise(resolve => {
                this.childProcess?.on("close", code => resolve(code || 0));
                this.childProcess?.on("error", error => {
                    console.error(error);
                    return resolve(1);
                });
            });
        }
        catch (error) {
            return 1;
        }
    }
}
