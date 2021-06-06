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

const options: Record<Option, boolean> = {
	watch: false,
	inspect: false,
}

let argsOffset = 2
let argument: string

while ((argument = argv[argsOffset]).startsWith("-")) {
	if (argument in argumentOptions) {
		options[argumentOptions[argument]] = true
		argsOffset++
	} else {
		console.log(`Unknown option ${argv[argsOffset]}`)
		process.exit(9)
	}
}

esrun(argv[argsOffset], argv.slice(argsOffset + 1), options.watch, options.inspect)
