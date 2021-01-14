const { resolve } = require('path')
const { build } = require('esbuild')

async function esrun(inputFile, args=[]) {
	if (!inputFile) return console.log(`Missing input file`)
	inputFile = resolve(inputFile)

	const buildResult = await build({
		entryPoints: [inputFile],
		bundle: true,
		write: false,
		platform: 'node',
	})
	const code = buildResult.outputFiles[0].text
	const evaluator = new Function('process', code)
	process.argv = [process.argv[0], inputFile, ...args]

	return evaluator(process)
}

module.exports = esrun
