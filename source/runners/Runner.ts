import { build, BuildOptions, Plugin } from "esbuild"
import type { BuildResult, OutputFile } from "esbuild"
import addJsExtensions from "@digitak/grubber/library/utilities/addJsExtensions"
import resolveDependency from "../tools/resolveDependency"
import { ChildProcess, spawn } from "child_process"
import findInputFile from "../tools/findInputFile"
import { Options } from "../types/Options"

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

	constructor(inputFile: string, options?: Options) {
		this.inputFile = findInputFile(inputFile)

		this.args = options?.args ?? []
		this.watch = options?.watch ?? false
		this.inspect = options?.inspect ?? false
		this.interProcessCommunication = options?.interProcessCommunication ?? false
		this.makeAllPackagesExternal = options?.makeAllPackagesExternal ?? true
		this.exitAfterExecution = options?.exitAfterExecution ?? true
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

		if (this.makeAllPackagesExternal) {
			plugins.push({
				name: "make-all-packages-external",
				setup: build => {
					const filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/ // Must not start with "/" or "./" or "../"
					build.onResolve({ filter }, args => {
						return {
							path: args.path,
							external: true,
						}
					})
				},
			})
		}

		plugins.push({
			name: "list-dependencies",
			setup: build => {
				build.onLoad({ filter: /.*/ }, async ({ path }) => {
					this.dependencies.push(path)
					return null
				})
			},
		})

		try {
			this.buildOutput = await build({
				entryPoints: [this.inputFile],
				bundle: true,
				platform: "node",
				format: "esm",
				incremental: !!this.watch,
				plugins,
				...(buildOptions ?? {}),
				write: false,
			})
			this.outputCode = this.buildOutput?.outputFiles[0]?.text || ""
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
		let code = addJsExtensions(this.outputCode, resolveDependency)

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
				this.childProcess?.on("close", code => resolve(code || 0))
				this.childProcess?.on("error", error => {
					console.error(error)
					return resolve(1)
				})
			})
		} catch (error) {
			return 1
		}
	}
}
