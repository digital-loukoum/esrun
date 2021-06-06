import type { BuildResult, OutputFile } from "esbuild/lib/main.js";
export declare type Output = null | (BuildResult & {
    outputFiles: OutputFile[];
});
export default class Runner {
    args: string[];
    protected inspect: boolean;
    input: string;
    protected output: Output;
    protected dependencies: string[];
    protected watch: boolean;
    constructor(input: string, args?: string[], inspect?: boolean);
    get outputCode(): string;
    run(): Promise<void>;
    execute(): Promise<number>;
    build(): Promise<void>;
}
