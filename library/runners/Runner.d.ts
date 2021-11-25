/// <reference types="node" />
import type { BuildResult, OutputFile } from "esbuild/lib/main.js";
import { ChildProcess } from "child_process";
export declare type Output = null | (BuildResult & {
    outputFiles: OutputFile[];
});
export default class Runner {
    args: string[];
    protected watch: boolean | string[];
    protected inspect: boolean;
    input: string;
    protected output: Output;
    protected dependencies: string[];
    protected childProcess?: ChildProcess;
    constructor(input: string, args?: string[], watch?: boolean | string[], inspect?: boolean);
    get outputCode(): string;
    run(): Promise<void>;
    build(): Promise<void>;
    transform(transformer: (content: string) => string | Promise<string>): Promise<void>;
    execute(): Promise<number>;
}
