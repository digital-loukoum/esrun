const { dirname, basename, resolve } = require('path')
const { build } = require('esbuild')

async function esrun() {
	if (!arguments.length) return console.log(`Missing input file`)
	arguments[0] = resolve(arguments[0])
	const inputFile = arguments[0]

	const buildResult = await build({
		entryPoints: [inputFile],
		bundle: true,
		write: false,
	})
	const code = buildResult.outputFiles[0].text
	const evaluator = new Function('__dirname', '__filename', code)
	const directory = dirname(inputFile)
	const file = basename(inputFile)

	// we transform `process`
	process.argv = [process.argv[0], ...arguments]

	return evaluator(directory, file)
}

module.exports = esrun
