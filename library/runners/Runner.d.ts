/// <reference types="node" />
import { BuildOptions } from "esbuild/lib/main.js";
import type { BuildResult, OutputFile } from "esbuild/lib/main.js";
import { ChildProcess } from "child_process";
export declare type BuildOutput = null | (BuildResult & {
    outputFiles: OutputFile[];
});
export default class Runner {
    args: string[];
    protected watch: boolean | string[];
    protected inspect: boolean;
    inputFile: string;
    output: string;
    protected buildOutput: BuildOutput;
    protected dependencies: string[];
    protected childProcess?: ChildProcess;
    constructor(inputFile: string, args?: string[], watch?: boolean | string[], inspect?: boolean);
    get outputCode(): string;
    run(): Promise<void>;
    build(buildOptions?: BuildOptions): Promise<void>;
    transform(transformer: (content: string) => string | Promise<string>): Promise<void>;
    execute(): Promise<number>;
}
