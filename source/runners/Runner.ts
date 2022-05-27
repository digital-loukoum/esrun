import { build, BuildOptions, Plugin } from "esbuild"
import type { BuildResult, OutputFile } from "esbuild"
import { ChildProcess, spawn } from "child_process"
import findInputFile from "../tools/findInputFile.js"
import { Options } from "../types/Options.js"
import { fileConstantsPlugin } from "../plugins/fileConstants.js"
import { makePackagesExternalPlugin } from "../plugins/makePackagesExternal.js"
import path from "path"

export type BuildOutput =
	| null
	| (BuildResult & {
			outputFiles: OutputFile[]
	  })

export default class Runner {
	public inputFile: string
	public output = ""
	public stdout = ""
	public stderr = ""
	public outputCode = ""
	public args: string[] = []
	public tsConfigFile: string | undefined
	public preserveConsole: boolean
	public fileConstants: boolean
	public beforeRun: Options["beforeRun"]
	public afterRun: Options["afterRun"]

	protected watch: boolean | string[]
	protected inspect: boolean
	protected interProcessCommunication
	protected makeAllPackagesExternal
	protected exitAfterExecution

	protected buildOutput: BuildOutput = null
	protected dependencies: string[] = []
	protected childProcess?: ChildProcess

	getDependencies(): readonly string[] {
		return this.dependencies
	}

	protected retrieveDependencies(): string[] {
		return Object.keys(this.buildOutput?.metafile?.inputs ?? []).map(input =>
			path.resolve(input)
		)
	}

	constructor(inputFile: string, options?: Options) {
		this.inputFile = findInputFile(inputFile)

		this.args = options?.args ?? []
		this.watch = options?.watch ?? false
		this.preserveConsole = options?.preserveConsole ?? false
		this.inspect = options?.inspect ?? false
		this.fileConstants = options?.fileConstants ?? true
		this.tsConfigFile = options?.tsConfigFile
		this.interProcessCommunication = options?.interProcessCommunication ?? false
		this.makeAllPackagesExternal = options?.makeAllPackagesExternal ?? true
		this.exitAfterExecution = options?.exitAfterExecution ?? true
		this.beforeRun = options?.beforeRun
		this.afterRun = options?.afterRun
	}

	async run() {
		try {
			await this.build()
			const status = await this.execute()
			if (this.exitAfterExecution) {
				process.exit(status)
			}
		} catch (error) {
			console.error(error)
			process.exit(1)
		}
	}

	async build(buildOptions?: BuildOptions) {
		const plugins: Plugin[] = []

		if (this.fileConstants) {
			plugins.push(fileConstantsPlugin())
		}
		if (this.makeAllPackagesExternal) {
			plugins.push(makePackagesExternalPlugin())
		}

		try {
			this.buildOutput = await build({
				entryPoints: [this.inputFile],
				bundle: true,
				platform: "node",
				format: "esm",
				incremental: !!this.watch,
				plugins,
				tsconfig: this.tsConfigFile,
				...(buildOptions ?? {}),
				write: false,
				metafile: true,
			})
			this.outputCode = this.buildOutput?.outputFiles[0]?.text || ""
			this.dependencies = this.retrieveDependencies()
		} catch (error) {
			this.buildOutput = null
			this.outputCode = ""
		}
	}

	async transform(transformer: (content: string) => string | Promise<string>) {
		this.outputCode = await transformer(this.outputCode)
	}

	async execute(): Promise<number> {
		this.output = this.stdout = this.stderr = ""
		if (!this.buildOutput) return 1
		await this.beforeRun?.()
		let code = this.outputCode

		const commandArgs = []
		if (this.inspect) {
			commandArgs.push("--inspect")
			code = `setTimeout(() => console.log("Process timeout"), 3_600_000);` + code
		}

		commandArgs.push(
			"--input-type=module",
			"--eval",
			code,
			"--",
			this.inputFile,
			...this.args
		)

		try {
			this.childProcess = spawn("node", commandArgs, {
				stdio: this.interProcessCommunication
					? ["pipe", "pipe", "pipe", "ipc"]
					: "inherit",
			})
			if (this.interProcessCommunication) {
				this.childProcess?.on("message", message => {
					this.output += message.toString()
				})
				this.childProcess?.stdout?.on("data", data => {
					this.stdout += data.toString()
				})
				this.childProcess?.stderr?.on("data", data => {
					this.stderr += data.toString()
				})
			}

			return new Promise(resolve => {
				const done = async (code?: number) => {
					await this.afterRun?.()
					resolve(code ?? 0)
				}

				this.childProcess?.on("close", done)
				this.childProcess?.on("error", async error => {
					console.error(error)
					done(1)
				})
			})
		} catch (error) {
			return 1
		}
	}
}
