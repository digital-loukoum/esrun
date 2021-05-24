import { relative, resolve, basename } from "path"
import esbuild from "esbuild"
import { existsSync, statSync, readFileSync } from "fs"
import { spawnSync } from "child_process"
import addJsExtensions from "@digitak/grubber/library/utilities/addJsExtensions.js"
import { createRequire } from "module"

const require = createRequire(process.cwd())
const nodeResolve = dependency => require.resolve(dependency, { paths: [process.cwd()] })

const { build } = esbuild

/**
 * Run any .ts or .js file
 */
export default async function esrun(inputFile, args = []) {
	try {
		if (!inputFile) throw `Missing input file`
		inputFile = findInputFile(resolve(inputFile))

		const buildResult = await build({
			entryPoints: [inputFile],
			bundle: true,
			write: false,
			platform: "node",
			format: "esm",
			plugins: [
				{
					name: "make-all-packages-external",
					setup(build) {
						let filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/ // Must not start with "/" or "./" or "../"
						build.onResolve({ filter }, args => ({
							path: args.path,
							external: true,
						}))
					},
				},
			],
		})

		const code = buildResult.outputFiles[0].text

		// we replace all dependencies by their exact file URL with the '.js' extension
		const patchedCode = addJsExtensions(code, nodeResolve)

		const { status } = spawnSync(
			"node",
			[
				"--input-type=module",
				"--eval",
				patchedCode.replace(/'/g, "\\'"),
				"--",
				inputFile,
				...args,
			],
			{
				stdio: "inherit",
			}
		)
		process.exit(status)
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
