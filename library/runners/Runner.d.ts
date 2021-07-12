import type { BuildResult, OutputFile } from "esbuild/lib/main.js";
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
    constructor(input: string, args?: string[], watch?: boolean | string[], inspect?: boolean);
    get outputCode(): string;
    run(): Promise<void>;
    execute(): Promise<number>;
    build(): Promise<void>;
}
