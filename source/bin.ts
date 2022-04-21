#!/usr/bin/env node
import esrun from "./index.js"
import { CliOption } from "./types/CliOption.js"

const { argv } = process

const argumentOptions: Record<string, CliOption> = {
	"--watch": "watch",
	"-w": "watch",
	"--inspect": "inspect",
	"-i": "inspect",
	"--preserveConsole": "preserveConsole",
}

const options: Record<CliOption, boolean | string[]> = {
	watch: false,
	inspect: false,
	preserveConsole: false,
}

let argsOffset = 2
let argument: string

if (argv.length < argsOffset) {
	console.log("Missing typescript input file")
	process.exit(0)
}

while ((argument = argv[argsOffset]).startsWith("-")) {
	const [command, parameters] = argument.split(":")

	if (command in argumentOptions) {
		options[argumentOptions[command]] = parameters ? parameters.split(",") : true
		argsOffset++
	} else {
		console.log(`Unknown option ${command}`)
		process.exit(9)
	}
}

esrun(argv[argsOffset], {
	args: argv.slice(argsOffset + 1),
	watch: options.watch,
	inspect: !!options.inspect,
	preserveConsole: !!options.preserveConsole,
}).catch(error => {
	console.error(error)
	process.exit(1)
})
