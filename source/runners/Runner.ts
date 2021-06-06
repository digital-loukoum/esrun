import { build } from "esbuild"
import type { BuildResult, OutputFile } from "esbuild"
import addJsExtensions from "@digitak/grubber/library/utilities/addJsExtensions"
import resolveDependency from "../resolveDependency"
import { fork, spawn } from "child_process"
import findInputFile from "../tools/findInputFile"
// import path from "path"
// import { fileURLToPath } from "url"
import inspector from "inspector"

export type Output =
	| null
	| (BuildResult & {
			outputFiles: OutputFile[]
	  })

export default class Runner {
	public input: string
	protected output: Output = null
	protected dependencies: string[] = []
	protected readonly watch: boolean = false

	constructor(
		input: string,
		public args: string[] = [],
		protected readonly inspect: boolean = false
	) {
		this.input = findInputFile(input)
	}

	get outputCode(): string {
		return this.output?.outputFiles[0]?.text || ""
	}

	async run() {
		try {
			if (this.inspect) this.runInspector()
			console.log("Inspect?", this.inspect)
			await this.build()
			process.exit(await this.execute())
		} catch (error) {
			console.error(error)
			process.exit(1)
		}
	}

	async execute(): Promise<number> {
		if (!this.output) return 1
		let code = addJsExtensions(this.outputCode, resolveDependency)

		const commandArgs = []
		if (this.inspect) {
			code = `import { console } from "inspector";\n` + code
		}

		commandArgs.push(
			"--input-type=module",
			"--eval",
			code.replace(/'/g, "\\'"),
			"--",
			this.input,
			...this.args
		)

		try {
			console.log("Spawning...")
			const child = spawn("node", commandArgs, {
				// stdio: [inspector.console],
			})
			child.stdout?.on("data", data => console.log(data.toString()))
			child.stderr?.on("data", data => console.error(data.toString()))

			return new Promise(resolve => {
				child.on("close", code => resolve(code || 0))
				child.on("error", error => {
					console.error(error)
					return resolve(1)
				})
			})
		} catch (error) {
			return 1
		}
	}

	async build() {
		try {
			this.output = await build({
				entryPoints: [this.input],
				bundle: true,
				write: false,
				platform: "node",
				format: "esm",
				incremental: this.watch,
				plugins: [
					{
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
					},
					{
						name: "list-dependencies",
						setup: build => {
							build.onLoad({ filter: /.*/ }, async ({ path }) => {
								this.dependencies.push(path)
								return null
							})
						},
					},
				],
			})
		} catch (error) {
			this.output = null
		}
	}

	/**
	 * Start an inspect process.
	 * The process can receive js code and will execute it
	 */
	runInspector() {
		inspector.open(undefined, undefined, true)
		// console.log("Running inspector")
		// const inspectorPath = path.resolve(
		// 	`${path.dirname(fileURLToPath(import.meta.url))}/../tools/inspector.js`
		// )
		// const inspector = fork(inspectorPath)
		// inspector.on("exit", () => process.exit())
		// inspector.send("Hello you ;)")
		// setTimeout(() => inspector.send("Hello???"), 8_000)
	}
}
