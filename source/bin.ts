#!/usr/bin/env node
import esrun from "./main.js"
import type { Option } from "./Option"

const { argv } = process

const argumentOptions: Record<string, Option> = {
	"--watch": "watch",
	"-w": "watch",
	"--inspect": "inspect",
	"-i": "inspect",
}

const options: Record<Option, boolean | string[]> = {
	watch: false,
	inspect: false,
}

let argsOffset = 2
let argument: string

while ((argument = argv[argsOffset]).startsWith("-")) {
	const [command, parameters] = argument.split(':')
	
	if (command in argumentOptions) {
		options[argumentOptions[command]] = parameters ? parameters.split(',') : true
		argsOffset++
	} else {
		console.log(`Unknown option ${command}`)
		process.exit(9)
	}
}

esrun(argv[argsOffset], argv.slice(argsOffset + 1), options.watch, !!options.inspect)
