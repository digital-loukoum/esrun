#!/usr/bin/env node
import esrun from "./main.js"

const { argv } = process

const possibleOptions = {
	watch: ["--watch", "-w"],
	inspect: ["--inspect", "-i"],
}

const options = {
	watch: false,
	inspect: false,
}

let argsOffset = 2

parseArgument: while (argv[argsOffset]) {
	for (const option in possibleOptions) {
		if (possibleOptions[option].includes(argv[argsOffset])) {
			options[option] = true
			argsOffset++
			continue parseArgument
		}
	}
	break
}

esrun(argv[argsOffset], argv.slice(argsOffset + 1), options.watch, options.inspect)
