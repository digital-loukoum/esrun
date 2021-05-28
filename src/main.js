import { relative, resolve, basename, join } from "path"
import esbuild from "esbuild"
import { existsSync, statSync, readFileSync } from "fs"
import { spawnSync } from "child_process"
import addJsExtensions from "@digitak/grubber/library/utilities/addJsExtensions.js"
import { createRequire } from "module"
import chokidar from "chokidar"

const require = createRequire(process.cwd())
const nodeResolve = dependency => require.resolve(dependency, { paths: [process.cwd()] })

/**
 * Run any .ts or .js file
 */
export default async function esrun(inputFile, args = []) {
	try {
		if (!inputFile) throw `Missing input file`
		inputFile = findInputFile(resolve(inputFile))

		const watch = args[0] == "--watch" || args[0] == "-w"
		if (watch) args.shift()

		// list of all modules bundled
		const dependencies = []
		let buildResult = null
		let buildSucceeded = false

		const build = async () => {
			try {
				buildResult = await esbuild.build({
					entryPoints: [inputFile],
					bundle: true,
					write: false,
					platform: "node",
					format: "esm",
					incremental: watch,
					plugins: [
						{
							name: "make-all-packages-external",
							setup(build) {
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
							setup(build) {
								build.onLoad({ filter: /.*/ }, ({ path }) => {
									dependencies.push(path)
								})
							},
						},
					],
				})
				buildSucceeded = true
			} catch (error) {
				buildResult = null
				buildSucceeded = false
			}
		}

		const executeBuild = () => {
			if (!buildSucceeded) return 1
			const code = addJsExtensions(buildResult.outputFiles[0].text, nodeResolve)
			try {
				const { status } = spawnSync(
					"node",
					[
						"--input-type=module",
						"--eval",
						code.replace(/'/g, "\\'"),
						"--",
						inputFile,
						...args,
					],
					{
						stdio: "inherit",
					}
				)
				return status
			} catch (error) {
				return 1
			}
		}

		if (watch) {
			console.clear()
			await build()
			executeBuild()
			const watcher = chokidar.watch([...dependencies, "package.json"])

			const rebuild = async path => {
				console.clear()
				dependencies.length = 0
				if (buildSucceeded) {
					try {
						buildResult = await buildResult.rebuild()
					} catch (error) {
						buildResult = null
						buildSucceeded = false
					}
				} else await build()

				executeBuild()

				// we update the list of watched files
				if (buildSucceeded) {
					const watchedDependencies = []
					for (const [directory, files] of Object.entries(watcher.getWatched())) {
						watchedDependencies.push(...files.map(file => join(directory, file)))
					}

					for (const dependency of watchedDependencies)
						if (dependency != "package.json" && !dependencies.includes(dependency))
							watcher.unwatch(dependency)

					for (const dependency of dependencies)
						if (!watchedDependencies.includes(dependency)) watcher.add(dependency)
				}
			}

			watcher.on("change", rebuild)
			watcher.on("unlink", rebuild)
		} else {
			await build()
			process.exit(executeBuild())
		}
	} catch (error) {
		console.error(error)
		process.exit(1)
	}
}

/**
 * Intelligent function that looks for the right file to load
 * If the file does not exist, try to add a '.ts' and a '.js' extension
 * If the inputFile is a directory, check for a entry point inside the directory
 */
export function findInputFile(path) {
	if (!existsSync(path)) {
		if (existsSync(`${path}.ts`)) path = `${path}.ts`
		else if (existsSync(`${path}.js`)) path = `${path}.js`
		else throw `Path '${path}' does not exist`
	}

	const stat = statSync(path)
	if (stat.isFile()) return path
	else if (stat.isDirectory()) {
		// first we check if there is a package.json file with a `main` key
		const packageFile = resolve(path, "package.json")
		if (existsSync(packageFile) && statSync(packageFile).isFile()) {
			const { main } = JSON.parse(readFileSync(packageFile, "utf8"))
			if (main) return findInputFile(resolve(path, main))
		}

		// otherwise we look for a default entry point
		const name = basename(path)
		for (const subpath of [
			resolve(path, "index.ts"),
			resolve(path, name),
			resolve(path, `${name}.ts`),
			resolve(path, "main.ts"),
			resolve(path, "index.js"),
			resolve(path, `${name}.js`),
			resolve(path, "main.js"),
		])
			if (existsSync(subpath) && statSync(subpath).isFile()) return subpath

		throw `Could not resolve an entry point in folder '${path}`
	} else throw `Path '${path}' should be a file or a directory`
}
