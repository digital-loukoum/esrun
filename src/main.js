const { resolve, basename } = require('path')
const { build } = require('esbuild')
const { existsSync, statSync, readFileSync } = require('fs')

/**
 * Intelligent function that looks for the right file to load
 * If the file does not exist, try to add a '.ts' and a '.js' extension
 * If the inputFile is a directory, check for a entry point inside the directory
 */
function findInputFile(path) {
	if (!existsSync(path)) {
		if (existsSync(`${path}.ts`))
			path = `${path}.ts`
		else if (existsSync(`${path}.js`))
			path = `${path}.js`
		else throw `Path '${path}' does not exist`
	}

	const stat = statSync(path)
	if (stat.isFile())
		return path
	else if (stat.isDirectory()) {
		// first we check if there is a package.json file with a `main` key
		const packageFile = resolve(path, 'package.json')
		if (existsSync(packageFile) && statSync(packageFile).isFile()) {
			const package = JSON.parse(readFileSync(packageFile, 'utf8'))
			if (package.main) return findInputFile(resolve(path, package.main))
		}

		// otherwise we look for a default entry point
		const name = basename(path)
		for (const subpath of [
			resolve(path, 'index.ts'),
			resolve(path, name),
			resolve(path, `${name}.ts`),
			resolve(path, 'main.ts'),
			resolve(path, 'index.js'),
			resolve(path, `${name}.js`),
			resolve(path, 'main.js'),
		]) if (existsSync(subpath) && statSync(subpath).isFile())
			return subpath

		throw `Could not resolve an entry point in folder '${path}`
	}
	else throw `Path '${path}' should be a file or a directory`
}

/**
 * Run a .ts or .js file
 */
async function esrun(inputFile, args=[]) {
	try {
		if (!inputFile) throw `Missing input file`
		inputFile = findInputFile(resolve(inputFile))

		const buildResult = await build({
			entryPoints: [inputFile],
			bundle: true,
			write: false,
			platform: 'node',
			'external:fsevents': true,
		})
		const code = buildResult.outputFiles[0].text
		const evaluator = new Function('process', 'require', code)
		process.argv = [process.argv[0], inputFile, ...args]

		return evaluator(process, require)
	}
	catch (error) {
		console.error(error)
		return 1
	}
}

module.exports = esrun
