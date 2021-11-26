import { build } from "esbuild/lib/main.js";
import addJsExtensions from "@digitak/grubber/library/utilities/addJsExtensions.js";
import resolveDependency from "../tools/resolveDependency.js";
import { spawn } from "child_process";
import findInputFile from "../tools/findInputFile.js";
export default class Runner {
    constructor(inputFile, args = [], watch = false, inspect = false) {
        this.args = args;
        this.watch = watch;
        this.inspect = inspect;
        this.output = "";
        this.buildOutput = null;
        this.dependencies = [];
        this.inputFile = findInputFile(inputFile);
    }
    get outputCode() {
        return this.buildOutput?.outputFiles[0]?.text || "";
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
    async build(buildOptions) {
        try {
            this.buildOutput = await build({
                entryPoints: [this.inputFile],
                bundle: true,
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
                ...(buildOptions ?? {}),
                write: false,
            });
        }
        catch (error) {
            this.buildOutput = null;
        }
    }
    async transform(transformer) {
        if (!this.buildOutput?.outputFiles[0])
            return;
        this.buildOutput.outputFiles[0].text = await transformer(this.buildOutput.outputFiles[0].text);
    }
    async execute() {
        this.output = "";
        if (!this.buildOutput)
            return 1;
        let code = addJsExtensions(this.outputCode, resolveDependency);
        const commandArgs = [];
        if (this.inspect) {
            commandArgs.push("--inspect");
            code = `setTimeout(() => console.log("Process timeout"), 3_600_000);` + code;
        }
        commandArgs.push("--input-type=module", "--eval", code.replace(/'/g, "\\'"), "--", this.inputFile, ...this.args);
        try {
            this.childProcess = spawn("node", commandArgs, {
                stdio: "inherit",
            });
            this.childProcess?.stdout?.on("data", data => (this.output += data));
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
