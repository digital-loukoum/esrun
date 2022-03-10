#!/usr/bin/env node
import esrun from "./main.js"
import type { ExecutionMode } from "./types/ExecutionMode"

const { argv } = process

const argumentOptions: Record<string, ExecutionMode> = {
	"--watch": "watch",
	"-w": "watch",
	"--inspect": "inspect",
	"-i": "inspect",
  	"-p": "preserveConsole",
  	"--preserveConsole": "preserveConsole",	
}

const options: Record<ExecutionMode, boolean | string[]> = {
	watch: false,
	inspect: false,
  	preserveConsole: false,
}

let argsOffset = 2
let argument: string

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
})
