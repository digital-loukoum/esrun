import type { BuildResult, OutputFile } from "esbuild/lib/main.js";
import type { Mode } from "../Mode.js";
export declare type Output = null | (BuildResult & {
    outputFiles: OutputFile[];
});
export default class Runner {
    args: string[];
    input: string;
    protected output: Output;
    protected dependencies: string[];
    constructor(input: string, args?: string[]);
    get mode(): Mode;
    get outputCode(): string;
    run(): Promise<void>;
    execute(): number;
    build(): Promise<void>;
    protected findInputFile(path: string): string;
}
