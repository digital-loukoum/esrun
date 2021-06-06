import type { BuildResult, OutputFile } from "esbuild/lib/main.js";
export declare type Output = null | (BuildResult & {
    outputFiles: OutputFile[];
});
export default class Runner {
    args: string[];
    protected readonly inspect: boolean;
    input: string;
    protected output: Output;
    protected dependencies: string[];
    protected readonly watch: boolean;
    constructor(input: string, args?: string[], inspect?: boolean);
    get outputCode(): string;
    run(): Promise<void>;
    execute(): Promise<number>;
    build(): Promise<void>;
    /**
     * Start an inspect process.
     * The process can receive js code and will execute it
     */
    runInspector(): void;
}
