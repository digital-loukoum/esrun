import { BuildOptions, Plugin, context, type BuildContext } from "esbuild";
import type { BuildResult, OutputFile } from "esbuild";
import { ChildProcess, spawn } from "child_process";
import findInputFile from "../tools/findInputFile.js";
import { Options } from "../types/Options.js";
import { fileConstantsPlugin } from "../plugins/fileConstants.js";
import path, { posix } from "path";
import { SendCodeMode } from "../types/SendCodeMode.js";
import { unlinkSync, writeFileSync } from "fs";
import { importRequire } from "../tools/importRequire.js";
import { grub } from "@digitak/grubber";

export type BuildOutput =
	| null
	| (BuildResult & {
			outputFiles: OutputFile[];
	  });

export default class Runner {
	public inputFile: string;
	public outputFile: undefined | string = undefined; // temporary output file
	public output = "";
	public stdout = "";
	public stderr = "";
	public outputCode = "";
	public args: string[] = [];
	public tsConfigFile: string | undefined;
	public preserveConsole: boolean;
	public fileConstants: boolean;
	public beforeRun: Options["beforeRun"];
	public afterRun: Options["afterRun"];
	public nodeOptions: Options["nodeOptions"] = {};
	public sendCodeMode: SendCodeMode;
	public sudo: boolean;
	public esbuildOptions: BuildOptions;

	protected watched: boolean | string[];
	protected inspect: boolean;
	protected interProcessCommunication;
	protected makeAllPackagesExternal;
	protected exitAfterExecution;

	protected buildContext?: BuildContext;
	protected buildOutput?: BuildResult<BuildOptions>;
	protected dependencies: string[] = [];
	protected childProcess?: ChildProcess;

	getDependencies(): readonly string[] {
		return this.dependencies;
	}

	protected retrieveDependencies(): string[] {
		return Object.keys(this.buildOutput?.metafile?.inputs ?? []).map((input) =>
			posix.resolve(input),
		);
	}

	constructor(inputFile: string, options?: Options) {
		this.inputFile = findInputFile(inputFile);

		this.args = options?.args ?? [];
		this.sudo = options?.sudo ?? false;
		this.watched = options?.watch ?? false;
		this.preserveConsole = options?.preserveConsole ?? false;
		this.inspect = options?.inspect ?? false;
		this.fileConstants = options?.fileConstants ?? true;
		this.tsConfigFile = options?.tsConfigFile;
		this.interProcessCommunication =
			options?.interProcessCommunication ?? false;
		this.makeAllPackagesExternal = options?.makeAllPackagesExternal ?? true;
		this.exitAfterExecution = options?.exitAfterExecution ?? true;
		this.beforeRun = options?.beforeRun;
		this.afterRun = options?.afterRun;
		this.nodeOptions = options?.nodeOptions ?? {};
		this.nodeOptions = options?.nodeOptions ?? {};
		this.esbuildOptions = options?.esbuildOptions ?? {};
		this.sendCodeMode =
			options?.sendCodeMode ?? process.platform === "win32"
				? "temporaryFile"
				: "cliParameters";
	}

	async run() {
		try {
			await this.build();
			const status = await this.execute();
			if (this.exitAfterExecution) {
				process.exit(status);
			}
		} catch (error) {
			console.error(error);
			process.exit(1);
		}
	}

	async build(buildOptions: BuildOptions = {}) {
		const plugins: Plugin[] = [];

		if (this.fileConstants) {
			plugins.push(fileConstantsPlugin());
		}
		try {
			this.buildContext = await context({
				entryPoints: [this.inputFile],
				bundle: true,
				platform: "node",
				format: "esm",
				plugins,
				sourcemap: "inline",
				sourceRoot: process.cwd(),
				tsconfig: this.tsConfigFile,
				external: this.makeAllPackagesExternal
					? [
							"./node_modules/*",
							"../node_modules/*",
							"../../node_modules/*",
							"../../../node_modules/*",
							"../../../../node_modules/*",
							"../../../../../node_modules/*",
							"../../../../../../node_modules/*",
							"../../../../../../../node_modules/*",
							"../../../../../../../../node_modules/*",
							"../../../../../../../../../node_modules/*",
							"../../../../../../../../../../node_modules/*",
					  ]
					: [],
				...this.esbuildOptions,
				...buildOptions,
				write: false,
				metafile: true,
			});
			this.buildOutput = await this.buildContext?.rebuild();
			this.outputCode = this.getOutputCode();

			// remove shebangs
			this.outputCode = grub(this.outputCode).replace(
				{ from: /^#!.*$/gm, to: "" },
			)
			
			this.dependencies = this.retrieveDependencies();
		} catch (error) {
			// No need to log the error as it has already been done by esbuild.
			this.buildOutput = undefined;
			this.outputCode = "";
		}
	}

	async transform(transformer: (content: string) => string | Promise<string>) {
		this.outputCode = await transformer(this.outputCode);
	}

	async execute(): Promise<number> {
		this.output = this.stdout = this.stderr = "";
		if (!this.buildOutput) return 1;

		let code = this.outputCode;
		let command = "node";
		let commandArgs: string[] = ["--enable-source-maps"];

		for (const nodeOption in this.nodeOptions) {
			let argument = `--${nodeOption}`;
			const parameters = this.nodeOptions[nodeOption];
			if (Array.isArray(parameters)) {
				argument += `=${parameters.join(",")}`;
			}
			commandArgs.push(argument);
		}

		if (this.inspect) {
			commandArgs.push("--inspect");
			code = `setTimeout(() => console.log("Process timeout"), 3_600_000);\n${code}`;
		}

		const evalArgs: Array<string> = [];

		if (this.sendCodeMode === "temporaryFile") {
			// we create a temporary file that we will execute
			const uniqueId = Date.now();
			this.outputFile = path.join(process.cwd(), `esrun-${uniqueId}.tmp.mjs`);
			code = importRequire(code, this.outputFile);
			code = `process.argv = [process.argv[0], ...process.argv.slice(3)];\n${code}`;
			writeFileSync(this.outputFile, code);
			evalArgs.push(this.outputFile);
		} else {
			code = importRequire(code, posix.resolve("index.js"));
			// we pass the code directly from the command line
			evalArgs.push("--input-type=module", "--eval", code);
		}

		commandArgs.push(...evalArgs, "--", this.inputFile, ...this.args);

		if (this.sudo) {
			commandArgs = [command, ...commandArgs];
			command = "sudo";
		}

		await this.beforeRun?.();

		try {
			this.childProcess = spawn(command, commandArgs, {
				stdio: this.interProcessCommunication
					? ["pipe", "pipe", "pipe", "ipc"]
					: "inherit",
			});

			if (this.interProcessCommunication) {
				this.childProcess?.on("message", (message) => {
					this.output += message.toString();
				});
				this.childProcess?.stdout?.on("data", (data) => {
					this.stdout += data.toString();
				});
				this.childProcess?.stderr?.on("data", (data) => {
					this.stderr += data.toString();
				});
			}

			return new Promise((resolve) => {
				const done = async (code?: number) => {
					await this.afterRun?.();
					if (this.outputFile) {
						unlinkSync(this.outputFile);
					}
					resolve(code ?? 0);
				};

				this.childProcess?.on("close", done);
				this.childProcess?.on("error", async (error) => {
					console.error(error);
					done(1);
				});
			});
		} catch (error) {
			console.error(error);
			return 1;
		}
	}

	getOutputCode() {
		return this.buildOutput?.outputFiles?.[0]?.text || "";
	}
}
